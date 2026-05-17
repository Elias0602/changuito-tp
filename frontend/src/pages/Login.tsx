import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const { login, verify2FA } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [twoFAStep, setTwoFAStep] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);
  const [code, setCode] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.twoFactorRequired && res.userId) {
        setPendingUserId(res.userId);
        setTwoFAStep(true);
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handle2FA(e: React.FormEvent) {
    e.preventDefault();
    if (!pendingUserId) return;
    setError("");
    setLoading(true);
    try {
      await verify2FA(pendingUserId, code);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {!twoFAStep ? (
          <>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 36 }}>🛒</div>
              <h2 style={{ marginTop: 8 }}>Ingresá a tu cuenta</h2>
              <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                Bienvenido/a a Autoservicio El Chanquito
              </p>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  placeholder="tu@email.com"
                />
              </div>
              <div className="form-group">
                <label>Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Ingresando…" : "Ingresar"}
              </button>
            </form>

            <p className="muted text-center mt-3">
              ¿No tenés cuenta?{" "}
              <Link to="/register">Creá una gratis</Link>
            </p>
          </>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 36 }}>🔒</div>
              <h2 style={{ marginTop: 8 }}>Verificación en 2 pasos</h2>
              <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                Ingresá el código de tu app autenticadora
              </p>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handle2FA}>
              <div className="form-group">
                <label>Código de 6 dígitos</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  maxLength={6}
                  autoFocus
                  style={{ fontSize: 22, letterSpacing: 8, textAlign: "center" }}
                  placeholder="000000"
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || code.length !== 6}
              >
                {loading ? "Verificando…" : "Verificar"}
              </button>
            </form>

            <button
              className="btn-ghost mt-3"
              style={{ display: "block", margin: "12px auto 0" }}
              onClick={() => { setTwoFAStep(false); setCode(""); }}
            >
              ← Volver al login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
