import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

type Step = "idle" | "setup" | "disable";

export function Cuenta() {
  const { user, refresh } = useAuth();
  const [step, setStep] = useState<Step>("idle");
  const [qrData, setQrData] = useState<{ qrDataUrl: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // refresh al entrar a la página para tener el estado actualizado
  useEffect(() => {
    refresh();
  }, []);

  if (!user) return null;

  function reset() {
    setStep("idle");
    setQrData(null);
    setCode("");
  }

  async function iniciar2FA() {
    setError(""); setMsg("");
    try {
      const res = await api<{ qrDataUrl: string; secret: string }>("/auth/2fa/setup", { method: "POST" });
      setQrData(res);
      setStep("setup");
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function confirmar2FA(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await api("/auth/2fa/confirm", { method: "POST", body: { token: code } });
      await refresh();
      reset();
      setMsg("✅ 2FA activado correctamente. Tu cuenta está más protegida.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function desactivar2FA(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await api("/auth/2fa/disable", { method: "POST", body: { token: code } });
      await refresh();
      reset();
      setMsg("2FA desactivado correctamente.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-narrow">
      <h2 className="section-title">👤 Mi cuenta</h2>

      <div style={{ background: "white", borderRadius: 6, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 20 }}>
        <h3 style={{ marginBottom: 16 }}>Datos personales</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <tbody>
            {[
              ["Nombre", user.nombre],
              ["Email", user.email],
              ["Rol", user.role],
              ["Jubilado/a", user.esJubilado ? "Sí (−21%)" : "No"],
              ["Estudiante", user.esEstudiante ? "Sí (−15%)" : "No"],
              ["2FA", user.twoFactorEnabled ? "Activo ✅" : "Inactivo"],
            ].map(([k, v]) => (
              <tr key={k} style={{ borderBottom: "1px solid #ededed" }}>
                <td style={{ padding: "10px 8px", color: "#666", width: "40%" }}>{k}</td>
                <td style={{ padding: "10px 8px", fontWeight: 500 }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ background: "white", borderRadius: 6, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <h3 style={{ marginBottom: 6 }}>🔒 Autenticación en dos pasos (2FA)</h3>
        <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
          Protegé tu cuenta con un código de 6 dígitos generado por Google Authenticator o Authy.
        </p>

        {msg && <div className="success-msg">{msg}</div>}
        {error && <div className="error-msg">{error}</div>}

        {user.twoFactorEnabled && step === "idle" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#00a650", fontWeight: 600, marginBottom: 16 }}>
              ✅ 2FA activo — Tu cuenta está protegida
            </div>
            <button
              className="btn-danger"
              onClick={() => { setStep("disable"); setError(""); setMsg(""); }}
              style={{ maxWidth: 220 }}
            >
              Desactivar 2FA
            </button>
          </div>
        )}

        {user.twoFactorEnabled && step === "disable" && (
          <div>
            <p style={{ fontSize: 13, marginBottom: 12, color: "#c0392b" }}>
              <strong>⚠️ Para desactivar 2FA</strong>, ingresá el código actual de tu app autenticadora.
            </p>
            <form onSubmit={desactivar2FA} style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label>Código de 6 dígitos</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  style={{ letterSpacing: 8, fontSize: 20, textAlign: "center" }}
                  autoFocus
                  placeholder="000000"
                />
              </div>
              <button
                type="submit"
                className="btn-danger"
                style={{ maxWidth: 140, marginBottom: 0 }}
                disabled={loading || code.length !== 6}
              >
                {loading ? "..." : "Desactivar"}
              </button>
            </form>
            <button className="btn-ghost mt-3" onClick={reset}>Cancelar</button>
          </div>
        )}

        {!user.twoFactorEnabled && step === "idle" && (
          <button className="btn-primary" onClick={iniciar2FA} style={{ maxWidth: 260 }}>
            Activar verificación en 2 pasos
          </button>
        )}

        {!user.twoFactorEnabled && step === "setup" && qrData && (
          <div>
            <p style={{ fontSize: 13, marginBottom: 12 }}>
              <strong>Paso 1:</strong> Escaneá este QR con Google Authenticator o Authy.
            </p>
            <div className="qr-box">
              <img src={qrData.qrDataUrl} alt="QR 2FA" />
              <div>
                <p style={{ fontSize: 12, color: "#666" }}>¿No podés escanear? Ingresá esta clave manualmente:</p>
                <code>{qrData.secret}</code>
              </div>
            </div>
            <p style={{ fontSize: 13, margin: "16px 0 8px" }}>
              <strong>Paso 2:</strong> Ingresá el código que te muestra la app para verificar.
            </p>
            <form onSubmit={confirmar2FA} style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label>Código de 6 dígitos</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  style={{ letterSpacing: 8, fontSize: 20, textAlign: "center" }}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                style={{ maxWidth: 140, marginBottom: 0 }}
                disabled={loading || code.length !== 6}
              >
                {loading ? "..." : "Confirmar"}
              </button>
            </form>
            <button className="btn-ghost mt-3" onClick={reset}>Cancelar</button>
          </div>
        )}
      </div>
    </div>
  );
}
