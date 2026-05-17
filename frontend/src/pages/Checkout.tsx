import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../components/ProductCard";

type Metodo = "QR" | "DEBITO" | "CREDITO";

interface OrderResult {
  order: { id: number; montoFinal: number; estado: string };
  pago: { comprobante: string; qr?: string };
}

export function Checkout() {
  const { cart, refresh } = useCart();
  const navigate = useNavigate();
  const [metodo, setMetodo] = useState<Metodo>("DEBITO");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<OrderResult | null>(null);

  const resumen = cart?.resumen;

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api<OrderResult>("/orders/checkout", {
        method: "POST",
        body: { metodoPago: metodo },
      });
      setResult(res);
      await refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Pantalla de éxito
  if (result) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card" style={{ maxWidth: 480 }}>
          <div className="text-center">
            <div style={{ fontSize: 60 }}>🎉</div>
            <h2 style={{ color: "#00a650", marginTop: 12 }}>¡Compra realizada!</h2>
            <p className="muted" style={{ marginTop: 8 }}>
              Pedido #{result.order.id} · Estado: <strong>{result.order.estado}</strong>
            </p>
            <p style={{ margin: "12px 0" }}>
              Total abonado: <strong>{formatPrice(result.order.montoFinal)}</strong>
            </p>
            <p className="muted" style={{ fontSize: 12 }}>
              Comprobante: {result.pago.comprobante}
            </p>

            {result.pago.qr && (
              <div className="qr-box" style={{ marginTop: 16 }}>
                <p style={{ fontSize: 13 }}>Escaneá el QR para registrar tu pago:</p>
                <img src={result.pago.qr} alt="QR pago" />
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "center" }}>
              <button className="btn-primary" onClick={() => navigate("/mis-pedidos")} style={{ flex: 1 }}>
                Ver mis pedidos
              </button>
              <button className="btn-secondary" onClick={() => navigate("/")} style={{ flex: 1 }}>
                Seguir comprando
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper" style={{ alignItems: "flex-start", paddingTop: 40 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, width: "100%", maxWidth: 900 }}>
        {/* Formulario de pago */}
        <div className="auth-card" style={{ maxWidth: "100%" }}>
          <h2>💳 Elegí cómo pagar</h2>
          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handlePay}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, margin: "16px 0" }}>
              {(["QR", "DEBITO", "CREDITO"] as Metodo[]).map((m) => (
                <label
                  key={m}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    border: `2px solid ${metodo === m ? "#3483fa" : "#ededed"}`,
                    borderRadius: 6,
                    padding: "14px 16px",
                    cursor: "pointer",
                    transition: "border-color 0.15s",
                  }}
                >
                  <input
                    type="radio"
                    name="metodo"
                    value={m}
                    checked={metodo === m}
                    onChange={() => setMetodo(m)}
                  />
                  <span style={{ fontSize: 22 }}>
                    {m === "QR" ? "📱" : m === "DEBITO" ? "💳" : "🏦"}
                  </span>
                  <div>
                    <strong>
                      {m === "QR" ? "Código QR" : m === "DEBITO" ? "Débito" : "Crédito"}
                    </strong>
                    <div className="muted" style={{ fontSize: 12 }}>
                      {m === "QR"
                        ? "Escaneá con la app de tu banco"
                        : m === "DEBITO"
                        ? "Débito inmediato a tu cuenta"
                        : "Hasta 12 cuotas sin interés"}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {metodo === "CREDITO" && (
              <div style={{ background: "#eaf2ff", borderRadius: 6, padding: "12px 14px", marginBottom: 16, fontSize: 13 }}>
                💡 Con tarjeta de crédito podés pagar en hasta 12 cuotas sin interés.
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? "Procesando pago…" : `Pagar ${resumen ? formatPrice(resumen.total) : ""}`}
            </button>
          </form>
        </div>

        {/* Resumen */}
        {resumen && (
          <div className="summary-card">
            <h3 style={{ marginBottom: 16 }}>Resumen de compra</h3>
            <div className="summary-row">
              <span>Productos ({cart!.items.length})</span>
              <span>{formatPrice(resumen.subtotal)}</span>
            </div>
            {resumen.descuentoPorcentaje > 0 && (
              <div className="summary-row discount">
                <span>Descuento ({resumen.descuentoPorcentaje}%)</span>
                <span>−{formatPrice(resumen.descuentoMonto)}</span>
              </div>
            )}
            <div className="summary-row" style={{ color: resumen.envioGratis ? "#00a650" : undefined }}>
              <span>
                Envío
                {resumen.descuentoEnvio > 0 && !resumen.envioGratis && (
                  <span style={{ color: "#1e8449", fontSize: 11, marginLeft: 6 }}>
                    −{resumen.descuentoEnvio}%
                  </span>
                )}
              </span>
              <span>
                {resumen.envioGratis ? "🎉 GRATIS" : (
                  <>
                    {resumen.descuentoEnvio > 0 && (
                      <span style={{ textDecoration: "line-through", color: "#999", fontSize: 12, marginRight: 6 }}>
                        {formatPrice(resumen.envioBase)}
                      </span>
                    )}
                    {formatPrice(resumen.envio)}
                  </>
                )}
              </span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatPrice(resumen.total)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
