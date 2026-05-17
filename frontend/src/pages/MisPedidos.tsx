import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Order } from "../types";
import { formatPrice } from "../components/ProductCard";
import { ProductImage } from "../components/ProductImage";

const ESTADO_LABELS: Record<string, string> = {
  PENDIENTE: "pendiente",
  LISTO: "listo",
  ENTREGADO: "entregado",
  CANCELADO: "cancelado",
};

export function MisPedidos() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Order[]>("/orders/me")
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container"><div className="spinner" /></div>;

  return (
    <div className="container">
      <h2 className="section-title">📦 Mis pedidos</h2>

      {orders.length === 0 ? (
        <div className="empty">
          <div className="empty-emoji">📭</div>
          <p>Todavía no hiciste ninguna compra.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {orders.map((o) => (
            <div key={o.id} style={{ background: "white", borderRadius: 6, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div className="flex-between" style={{ marginBottom: 12 }}>
                <div>
                  <strong>Pedido #{o.id}</strong>
                  <span className="muted" style={{ marginLeft: 12, fontSize: 13 }}>
                    {new Date(o.fechaPago).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}
                  </span>
                </div>
                <span className={`status-pill ${ESTADO_LABELS[o.estado]}`}>{o.estado}</span>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                {o.items.map((it) => (
                  <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 8, background: "#f9f9f9", borderRadius: 4, padding: "6px 10px" }}>
                    <ProductImage
                      nombre={it.product.nombre}
                      imagenUrl={it.product.imagenUrl}
                      categoria={it.product.category}
                      style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 4 }}
                    />
                    <div style={{ fontSize: 13 }}>
                      <div style={{ fontWeight: 500 }}>{it.product.nombre}</div>
                      <div className="muted">x{it.cantidad} · {formatPrice(it.precioSnapshot)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, borderTop: "1px solid #ededed", paddingTop: 10 }}>
                <span className="muted">Pago: {o.metodoPago}</span>
                {o.descuento > 0 && (
                  <span style={{ color: "#00a650" }}>−{formatPrice(o.descuento)} desc.</span>
                )}
                <strong>Total: {formatPrice(o.montoFinal)}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
