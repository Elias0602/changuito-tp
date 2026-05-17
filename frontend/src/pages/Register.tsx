import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    esJubilado: false,
    esEstudiante: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
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
        <h2>Creá tu cuenta</h2>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre completo</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Contraseña (mín. 6 caracteres)</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <div className="form-check">
            <input
              type="checkbox"
              id="jub"
              checked={form.esJubilado}
              onChange={(e) => setForm({ ...form, esJubilado: e.target.checked, esEstudiante: e.target.checked ? false : form.esEstudiante })}
            />
            <label htmlFor="jub">Soy jubilado/a — Descuento del 21% en mis compras</label>
          </div>
          <div className="form-check">
            <input
              type="checkbox"
              id="est"
              checked={form.esEstudiante}
              onChange={(e) => setForm({ ...form, esEstudiante: e.target.checked, esJubilado: e.target.checked ? false : form.esJubilado })}
            />
            <label htmlFor="est">Soy estudiante — Descuento del 15%</label>
          </div>

          <button type="submit" className="btn-primary mt-3" disabled={loading}>
            {loading ? "Creando…" : "Crear cuenta"}
          </button>
        </form>
        <p className="muted text-center mt-3">
          ¿Ya tenés cuenta? <Link to="/login">Ingresá</Link>
        </p>
      </div>
    </div>
  );
}
