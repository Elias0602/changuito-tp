import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { formatPrice } from "../components/ProductCard";
import { Loader } from "../components/Loader";

type Metodo = "MP" | "QR";

interface OrderResult {
  order: { id: number; montoFinal: number; estado: string };
  pago: { comprobante: string; qr?: string };
}

interface MPResult {
  orderId: number;
  initPoint: string;
  sandboxInitPoint?: string;
}

export function Checkout() {
  const { cart, refresh } = useCart();
  const navigate = useNavigate();
  const toast = useToast();
  const [metodo, setMetodo] = useState<Metodo>("MP");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OrderResult | null>(null);

  const resumen = cart?.resumen;

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (metodo === "MP") {
        const r = await api<MPResult>("/orders/checkout-mp", { method: "POST" });
        // Redirigimos a Mercado Pago
        window.location.href = r.initPoint;
        return;
      }

      const r = await api<OrderResult>("/orders/checkout", {
        method: "POST",
        body: { metodoPago: metodo },
      });
      setResult(r);
      await refresh();
      toast.success("¡Compra realizada!", `Pedido #${r.order.id} confirmado`);
    } catch (err: any) {
      toast.error("No se pudo procesar el pago", err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading && metodo === "MP") {
    return (
      <div className="container">
        <Loader text="Te estamos redirigiendo a Mercado Pago..." />
      </div>
    );
  }

  if (result) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card" style={{ maxWidth: 480 }}>
          <div className="text-center">
            <div style={{ fontSize: 70 }}>🎉</div>
            <h2 style={{ color: "var(--ml-green)", marginTop: 12 }}>¡Compra realizada!</h2>
            <p className="muted" style={{ marginTop: 8 }}>
              Pedido #{result.order.id} · {result.order.estado}
            </p>
            <p style={{ margin: "12px 0" }}>
              Total: <strong>{formatPrice(result.order.montoFinal)}</strong>
            </p>
            <p className="muted" style={{ fontSize: 12 }}>
              Comprobante: {result.pago.comprobante}
            </p>

            {result.pago.qr && (
              <div className="qr-box" style={{ marginTop: 16 }}>
                <p style={{ fontSize: 13 }}>Escaneá el QR:</p>
                <img src={result.pago.qr} alt="QR" />
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "center" }}>
              <button className="btn-primary" onClick={() => navigate("/mis-pedidos")} style={{ flex: 1 }}>
                Mis pedidos
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

  const opciones: { id: Metodo; emoji: string; label: string; desc: string; recomendado?: boolean; demo?: boolean }[] = [
    { id: "MP", emoji: "💳", label: "Tarjeta, transferencia o efectivo", desc: "Visa, Mastercard, MercadoPago, Rapipago. Pago real seguro.", recomendado: true },
    { id: "QR", emoji: "📱", label: "Código QR (demo)", desc: "Modo demostración — pago simulado", demo: true },
  ];

  return (
    <div className="auth-wrapper" style={{ alignItems: "flex-start", paddingTop: 40 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, width: "100%", maxWidth: 900 }}>
        <div className="auth-card" style={{ maxWidth: "100%" }}>
          {/*
            TODO ENVÍO — selector de dirección
            ------------------------------------------------------------
            Acá debería ir un selector con las direcciones del usuario
            (GET /api/addresses) para elegir a cuál enviar el pedido.
            Si no tiene ninguna, mostrar un link a /direcciones.
            Después hay que mandar la addressId al checkout y guardarla
            en el modelo Order (agregar campo addressId en Prisma).
          */}
          <div style={{
            background: "#fffaf0", borderRadius: 6, padding: "12px 14px",
            marginBottom: 16, fontSize: 13, border: "1px solid #ffe8c8"
          }}>
            📍 <strong>Dirección de envío</strong>
            <div className="muted" style={{ marginTop: 4 }}>
              Configurá tus direcciones desde <a href="/direcciones">Mis direcciones</a>.
              <br />
              <em style={{ fontSize: 11 }}>(módulo en desarrollo)</em>
            </div>
          </div>

          <h2>💳 Elegí cómo pagar</h2>

          <form onSubmit={handlePay}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, margin: "16px 0" }}>
              {opciones.map((m) => (
                <label
                  key={m.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    border: `2px solid ${metodo === m.id ? "var(--ml-blue)" : "var(--ml-border)"}`,
                    borderRadius: 6,
                    padding: "14px 16px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    position: "relative",
                    opacity: m.demo ? 0.85 : 1,
                  }}
                >
                  <input
                    type="radio"
                    name="metodo"
                    value={m.id}
                    checked={metodo === m.id}
                    onChange={() => setMetodo(m.id)}
                  />
                  <span style={{ fontSize: 22 }}>{m.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <strong>{m.label}</strong>
                    {m.recomendado && (
                      <span style={{ marginLeft: 8, background: "var(--ml-green)", color: "white", fontSize: 10, padding: "2px 8px", borderRadius: 99, fontWeight: 700 }}>
                        RECOMENDADO
                      </span>
                    )}
                    {m.demo && (
                      <span style={{ marginLeft: 8, background: "#999", color: "white", fontSize: 10, padding: "2px 8px", borderRadius: 99, fontWeight: 700 }}>
                        DEMO
                      </span>
                    )}
                    <div className="muted" style={{ fontSize: 12 }}>{m.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Procesando..." :
               metodo === "MP" ? `Pagar con Mercado Pago ${resumen ? formatPrice(resumen.total) : ""}` :
                                 `Pagar ${resumen ? formatPrice(resumen.total) : ""}`}
            </button>
          </form>
        </div>

        {resumen && (
          <div className="summary-card">
            <h3 style={{ marginBottom: 16 }}>Resumen</h3>
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
            <div className="summary-row" style={{ color: resumen.envioGratis ? "var(--ml-green)" : undefined }}>
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
