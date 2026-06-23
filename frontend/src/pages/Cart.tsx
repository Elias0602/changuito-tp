import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../components/ProductCard";
import { ProductImage } from "../components/ProductImage";
import { useState } from "react";

export function CartPage() {
  const { cart, loading, update, remove, clear } = useCart();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState<number | null>(null);

  async function handleQty(itemId: number, qty: number) {
    setUpdating(itemId);
    try {
      await update(itemId, qty);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(null);
    }
  }

  async function handleRemove(itemId: number) {
    setUpdating(itemId);
    try {
      await remove(itemId);
    } finally {
      setUpdating(null);
    }
  }

  if (loading) return <div className="container"><div className="spinner" /></div>;

  const items = cart?.items ?? [];
  const resumen = cart?.resumen;

  if (items.length === 0) {
    return (
      <div className="container">
        <div className="empty">
          <div className="empty-emoji">🛒</div>
          <p style={{ fontSize: 18, fontWeight: 600 }}>Tu carrito está vacío</p>
          <p className="muted" style={{ marginTop: 8 }}>Descubrí miles de productos y sumá los que más te gusten.</p>
          <Link to="/" className="btn-primary" style={{ display: "inline-block", marginTop: 20, padding: "12px 28px", borderRadius: 6 }}>
            Ver productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="flex-between mb-3">
        <h2 className="section-title" style={{ margin: 0 }}>🛒 Mi carrito ({items.length} {items.length === 1 ? "producto" : "productos"})</h2>
        <button className="btn-ghost" onClick={clear} style={{ color: "#f23d4f", fontSize: 13 }}>
          🗑 Vaciar carrito
        </button>
      </div>

      <div className="cart-layout">
        {/* Items */}
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.id} className="cart-item">
              <ProductImage
                nombre={item.product.nombre}
                imagenUrl={item.product.imagenUrl}
                categoria={item.product.category}
              />
              <div>
                <div style={{ fontWeight: 500 }}>{item.product.nombre}</div>
                <div className="muted" style={{ fontSize: 12 }}>
                  {item.product.category?.nombre}
                </div>
                <div style={{ fontSize: 18, margin: "6px 0" }}>
                  {formatPrice(item.precioSnapshot)}
                </div>
                <div className="qty-input">
                  <button
                    onClick={() => handleQty(item.id, item.cantidad - 1)}
                    disabled={updating === item.id || item.cantidad <= 1}
                  >
                    −
                  </button>
                  <span>{updating === item.id ? "…" : item.cantidad}</span>
                  <button
                    onClick={() => handleQty(item.id, item.cantidad + 1)}
                    disabled={updating === item.id}
                  >
                    +
                  </button>
                </div>
              </div>
              <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 8 }}>
                <strong style={{ fontSize: 16 }}>
                  {formatPrice(item.precioSnapshot * item.cantidad)}
                </strong>
                <button
                  className="btn-ghost"
                  onClick={() => handleRemove(item.id)}
                  disabled={updating === item.id}
                  style={{ color: "#f23d4f", fontSize: 13 }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        {resumen && (
          <div className="summary-card">
            <h3 style={{ marginBottom: 16 }}>Resumen</h3>

            <div className="summary-row">
              <span>Subtotal</span>
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

            {resumen.motivosDescuento.length > 0 && (
              <div style={{ background: "#e6f7ed", borderRadius: 4, padding: "8px 10px", margin: "8px 0", fontSize: 12, color: "#006b34" }}>
                ✅ {resumen.motivosDescuento.join(" · ")}
              </div>
            )}

            <div className="summary-row total">
              <span>Total</span>
              <span>{formatPrice(resumen.total)}</span>
            </div>

            <button
              className="btn-primary"
              style={{ marginTop: 16 }}
              onClick={() => navigate("/checkout")}
            >
              Continuar con la compra
            </button>
            <Link to="/" style={{ display: "block", textAlign: "center", marginTop: 10, fontSize: 13, color: "#3483fa" }}>
              Seguir comprando
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
