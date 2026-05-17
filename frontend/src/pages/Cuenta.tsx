import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

export function Cuenta() {
  const { user, refresh } = useAuth();
  const [step2fa, setStep2fa] = useState<"idle" | "setup" | "confirm">("idle");
  const [qrData, setQrData] = useState<{ qrDataUrl: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  if (!user) return null;

  async function iniciar2FA() {
    setError("");
    setMsg("");
    try {
      const res = await api<{ qrDataUrl: string; secret: string }>("/auth/2fa/setup", { method: "POST" });
      setQrData(res);
      setStep2fa("setup");
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function confirmar2FA(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api("/auth/2fa/confirm", { method: "POST", body: { token: code } });
      setMsg("✅ 2FA activado correctamente. Tu cuenta está más protegida.");
      setStep2fa("idle");
      await refresh();
    } catch (e: any) {
      setError(e.message);
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
            ].map(([k, v]) => (
              <tr key={k} style={{ borderBottom: "1px solid #ededed" }}>
                <td style={{ padding: "10px 8px", color: "#666", width: "40%" }}>{k}</td>
                <td style={{ padding: "10px 8px", fontWeight: 500 }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2FA Section */}
      <div style={{ background: "white", borderRadius: 6, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <h3 style={{ marginBottom: 6 }}>🔒 Autenticación en dos pasos (2FA)</h3>
        <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
          Protegé tu cuenta añadiendo una capa extra de seguridad con Google Authenticator o Authy.
        </p>

        {msg && <div className="success-msg">{msg}</div>}
        {error && <div className="error-msg">{error}</div>}

        {user.twoFactorEnabled ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#00a650", fontWeight: 600 }}>
            ✅ 2FA activo — Tu cuenta está protegida.
          </div>
        ) : step2fa === "idle" ? (
          <button className="btn-primary" onClick={iniciar2FA} style={{ maxWidth: 260 }}>
            Activar verificación en 2 pasos
          </button>
        ) : step2fa === "setup" && qrData ? (
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
              <button type="submit" className="btn-primary" style={{ maxWidth: 140, marginBottom: 0 }} disabled={code.length !== 6}>
                Confirmar
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}
