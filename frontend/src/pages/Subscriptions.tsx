import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { Plan, Subscription } from "../types";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../components/ProductCard";

export function Subscriptions() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [miSub, setMiSub] = useState<Subscription | null | undefined>(undefined);
  const [periodo, setPeriodo] = useState<"MENSUAL" | "ANUAL">("MENSUAL");
  const [loading, setLoading] = useState("");
  const [msg, setMsg] = useState("");

  const cargarSub = useCallback(async () => {
    if (!user) {
      setMiSub(null);
      return;
    }
    try {
      const s = await api<Subscription | null>("/subscriptions/mia");
      setMiSub(s);
    } catch {
      setMiSub(null);
    }
  }, [user]);

  useEffect(() => {
    api<Plan[]>("/subscriptions/planes").then(setPlanes);
    cargarSub();
  }, [cargarSub]);

  async function subscribir(plan: string) {
    if (!user) return navigate("/login");
    const p = periodo === "MENSUAL" && plan === "PLUS" ? "ANUAL" : periodo;
    setLoading(plan);
    setMsg("");
    try {
      await api("/subscriptions", { method: "POST", body: { plan, periodo: p } });
      await cargarSub();
      await refresh();
      setMsg(`¡Plan ${plan} activado! Ahora tenés 50% de descuento y envíos gratis.`);
    } catch (err: any) {
      setMsg("Error: " + err.message);
    } finally {
      setLoading("");
    }
  }

  async function cancelar() {
    if (!confirm("¿Seguro que querés cancelar tu suscripción?")) return;
    try {
      await api("/subscriptions", { method: "DELETE" });
      await cargarSub();
      await refresh();
      setMsg("Suscripción cancelada.");
    } catch (e: any) {
      setMsg("Error: " + e.message);
    }
  }

  const COLORES: Record<string, string> = {
    BASICO: "#3483fa",
    ESTANDAR: "#00a650",
    PLUS: "#e6a817",
  };

  return (
    <div className="container-narrow">
      <h1 className="section-title">🌟 Suscripciones</h1>
      <p className="muted" style={{ marginBottom: 24 }}>
        Suscribite y accedé a descuentos exclusivos, envíos gratis y atención prioritaria.
      </p>

      {msg && <div className="success-msg">{msg}</div>}

      {/* Suscripción activa */}
      {miSub && (
        <div style={{ background: "#e6f7ed", border: "1px solid #b2dfcc", borderRadius: 8, padding: "16px 20px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <strong>✅ Tu plan activo: {miSub.plan} {miSub.periodo}</strong>
            <div className="muted" style={{ fontSize: 13 }}>
              Vence: {new Date(miSub.fechaVencimiento).toLocaleDateString("es-AR")}
            </div>
          </div>
          <button className="btn-danger" onClick={cancelar} style={{ fontSize: 12 }}>Cancelar</button>
        </div>
      )}

      {/* Toggle mensual/anual */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 24, background: "#e9e9e9", borderRadius: 999, padding: 4, width: "fit-content", margin: "0 auto 24px" }}>
        {(["MENSUAL", "ANUAL"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            style={{
              padding: "8px 22px",
              borderRadius: 999,
              fontWeight: 600,
              background: periodo === p ? "white" : "transparent",
              boxShadow: periodo === p ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
              color: periodo === p ? "#333" : "#666",
              transition: "all 0.2s",
            }}
          >
            {p === "MENSUAL" ? "Mensual" : "Anual  🔖 -20%"}
          </button>
        ))}
      </div>

      <div className="plans">
        {planes.map((plan) => {
          const precio = periodo === "ANUAL" ? plan.anual : plan.mensual;
          const soloAnual = plan.plan === "PLUS";
          const precioMostrar = soloAnual ? plan.anual : precio;
          const isActivo = miSub?.plan === plan.plan && miSub.activa;

          return (
            <div
              key={plan.plan}
              className={`plan-card ${plan.plan === "ESTANDAR" ? "featured" : ""}`}
            >
              {plan.plan === "ESTANDAR" && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#ffe600", padding: "4px 14px", borderRadius: 999, fontWeight: 700, fontSize: 12 }}>
                  ⭐ MÁS POPULAR
                </div>
              )}
              <div className="plan-name" style={{ color: COLORES[plan.plan] }}>{plan.nombre}</div>
              <p className="plan-desc">{plan.descripcion}</p>

              {precioMostrar != null ? (
                <>
                  <div className="plan-price">{formatPrice(precioMostrar)}</div>
                  <div className="plan-period">
                    {soloAnual ? "/ año (solo anual)" : `/ ${periodo === "ANUAL" ? "año" : "mes"}`}
                  </div>
                </>
              ) : (
                <div className="muted" style={{ fontSize: 13 }}>Solo disponible anual</div>
              )}

              {plan.plan === "PLUS" && (
                <div style={{ background: "#fff8e1", borderRadius: 4, padding: "8px 10px", margin: "12px 0", fontSize: 12 }}>
                  Incluye <strong>50% de descuento + envío gratis</strong> en todas tus compras.
                </div>
              )}

              <button
                className="btn-primary"
                style={{ marginTop: 20, background: isActivo ? "#ccc" : COLORES[plan.plan] }}
                disabled={isActivo || loading === plan.plan}
                onClick={() => subscribir(plan.plan)}
              >
                {loading === plan.plan ? "Procesando…" :
                 isActivo ? "✅ Plan activo" :
                 miSub ? "Cambiar a este plan" : "Suscribirse"}
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ background: "white", borderRadius: 8, padding: 20, marginTop: 28, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <h3 style={{ marginBottom: 12 }}>💰 Descuentos dinámicos disponibles</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <tbody>
            {[
              ["👴 Jubilado", "21% de descuento", "Sin costo adicional"],
              ["🎓 Estudiante", "15% de descuento", "Sin costo adicional"],
              ["⭐ Suscriptor", "50% de descuento + envío gratis", "Requiere suscripción activa"],
            ].map(([quien, desc, nota]) => (
              <tr key={quien} style={{ borderBottom: "1px solid #ededed" }}>
                <td style={{ padding: "10px 8px", fontWeight: 600 }}>{quien}</td>
                <td style={{ padding: "10px 8px", color: "#00a650", fontWeight: 600 }}>{desc}</td>
                <td style={{ padding: "10px 8px", color: "#999", fontSize: 12 }}>{nota}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>
          * Se aplica el mayor descuento disponible. El envío gratis aplica sólo con suscripción activa.
        </p>
      </div>
    </div>
  );
}
