import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Order, Product } from "../types";
import { formatPrice } from "../components/ProductCard";

export function Repositor() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cantidades, setCantidades] = useState<Record<number, string>>({});
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [tab, setTab] = useState<"stock" | "pedidos">("stock");

  useEffect(() => {
    api<Product[]>("/products").then(setProducts);
    api<Order[]>("/orders").then(setOrders).catch(() => {});
  }, []);

  function notify(m: string, isErr = false) {
    if (isErr) { setErr(m); setMsg(""); }
    else { setMsg(m); setErr(""); }
    setTimeout(() => { setMsg(""); setErr(""); }, 4000);
  }

  async function reponer(id: number) {
    const cantidad = parseInt(cantidades[id] || "0");
    if (!cantidad || cantidad <= 0) return notify("Ingresá una cantidad válida", true);
    try {
      const p = await api<Product>(`/products/${id}/reponer`, { method: "POST", body: { cantidad } });
      setProducts((prev) => prev.map((pr) => pr.id === id ? { ...pr, stock: p.stock } : pr));
      setCantidades((prev) => { const n = { ...prev }; delete n[id]; return n; });
      notify(`✅ Stock repuesto. ${p.nombre}: ${p.stock} unidades`);
    } catch (e: any) { notify(e.message, true); }
  }

  async function cambiarEstado(id: number, estado: string) {
    await api(`/orders/${id}/estado`, { method: "PATCH", body: { estado } });
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, estado: estado as any } : o));
    notify("Estado actualizado");
  }

  const sinStock = products.filter((p) => p.stock === 0);
  const stockBajo = products.filter((p) => p.stock > 0 && p.stock <= 5);
  const pendientes = orders.filter((o) => o.estado === "PENDIENTE");

  return (
    <div className="container">
      <h2 className="section-title">📦 Panel de Repositor</h2>

      {/* KPIs rápidos */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Sin stock", value: sinStock.length, color: "#f23d4f" },
          { label: "Stock bajo (≤5)", value: stockBajo.length, color: "#e6a817" },
          { label: "Pedidos pendientes", value: pendientes.length, color: "#3483fa" },
          { label: "Total productos", value: products.length, color: "#00a650" },
        ].map((k) => (
          <div key={k.label} style={{ background: "white", borderRadius: 6, padding: "16px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 13, color: "#666" }}>{k.label}</div>
          </div>
        ))}
      </div>

      {msg && <div className="success-msg">{msg}</div>}
      {err && <div className="error-msg">{err}</div>}

      <div className="admin-tabs">
        <button className={tab === "stock" ? "active" : ""} onClick={() => setTab("stock")}>📦 Reposición de stock</button>
        <button className={tab === "pedidos" ? "active" : ""} onClick={() => setTab("pedidos")}>🧾 Pedidos ({pendientes.length} pendientes)</button>
      </div>

      {tab === "stock" && (
        <>
          {sinStock.length > 0 && (
            <div style={{ background: "#fce8e8", border: "1px solid #f5bebe", borderRadius: 6, padding: "10px 14px", marginBottom: 16, fontSize: 13 }}>
              ⚠️ <strong>{sinStock.length} productos</strong> sin stock: {sinStock.map(p => p.nombre).join(", ")}
            </div>
          )}

          <table className="admin-table">
            <thead>
              <tr><th>Producto</th><th>Categoría</th><th>Stock actual</th><th>Cantidad a reponer</th><th></th></tr>
            </thead>
            <tbody>
              {products
                .sort((a, b) => a.stock - b.stock)
                .map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{p.nombre}</div>
                    </td>
                    <td style={{ color: "#666" }}>{p.category?.icono} {p.category?.nombre}</td>
                    <td>
                      <span style={{
                        fontWeight: 700,
                        color: p.stock === 0 ? "#f23d4f" : p.stock <= 5 ? "#e6a817" : "#00a650"
                      }}>
                        {p.stock} {p.stock === 0 ? "❌" : p.stock <= 5 ? "⚠️" : "✅"}
                      </span>
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={cantidades[p.id] ?? ""}
                        onChange={(e) => setCantidades({ ...cantidades, [p.id]: e.target.value })}
                        placeholder="ej: 20"
                        style={{ width: 80, padding: "6px 8px", border: "1px solid #ccc", borderRadius: 4, fontSize: 13 }}
                      />
                    </td>
                    <td>
                      <button
                        className="btn-yellow"
                        style={{ padding: "6px 14px", fontSize: 13 }}
                        onClick={() => reponer(p.id)}
                        disabled={!cantidades[p.id]}
                      >
                        Reponer
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </>
      )}

      {tab === "pedidos" && (
        <table className="admin-table">
          <thead>
            <tr><th>#</th><th>Productos</th><th>Total</th><th>Método</th><th>Estado</th><th>Acción</th></tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", color: "#999" }}>Sin pedidos</td></tr>
            ) : orders.map((o) => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td style={{ fontSize: 12 }}>
                  {o.items.map((it) => `${it.product.nombre} x${it.cantidad}`).join(", ")}
                </td>
                <td>{formatPrice(o.montoFinal)}</td>
                <td>{o.metodoPago}</td>
                <td><span className={`status-pill ${o.estado.toLowerCase()}`}>{o.estado}</span></td>
                <td>
                  {o.estado === "PENDIENTE" && (
                    <button className="btn-primary" style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => cambiarEstado(o.id, "LISTO")}>
                      Marcar listo
                    </button>
                  )}
                  {o.estado === "LISTO" && (
                    <button className="btn-secondary" style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => cambiarEstado(o.id, "ENTREGADO")}>
                      Entregado
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
