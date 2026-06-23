import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Category, Offer, Order, Product } from "../types";
import { formatPrice } from "../components/ProductCard";

type Tab = "productos" | "categorias" | "ofertas" | "pedidos";

const ESTADOS_ORDER = ["PENDIENTE", "LISTO", "ENTREGADO", "CANCELADO"] as const;

export function Admin() {
  const [tab, setTab] = useState<Tab>("productos");

  // Productos
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pForm, setPForm] = useState({
    nombre: "", descripcion: "", precio: "", stock: "", categoryId: "", imagenUrl: "",
  });
  const [editingP, setEditingP] = useState<number | null>(null);
  const [editPrecio, setEditPrecio] = useState<{ [id: number]: string }>({});

  // Categorías
  const [catForm, setCatForm] = useState({ nombre: "", slug: "", icono: "" });

  // Ofertas
  const [offers, setOffers] = useState<Offer[]>([]);
  const [oForm, setOForm] = useState({ productId: "", porcentaje: "", fechaFin: "", esImperdible: false });

  // Pedidos
  const [orders, setOrders] = useState<Order[]>([]);

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  function notify(m: string, isErr = false) {
    if (isErr) { setErr(m); setMsg(""); }
    else { setMsg(m); setErr(""); }
    setTimeout(() => { setMsg(""); setErr(""); }, 4000);
  }

  useEffect(() => {
    api<Product[]>("/products").then(setProducts);
    api<Category[]>("/categories").then(setCategories);
    api<Offer[]>("/offers").then(setOffers);
    api<Order[]>("/orders").then(setOrders).catch(() => {});
  }, []);

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    try {
      const body = {
        nombre: pForm.nombre,
        descripcion: pForm.descripcion || undefined,
        precio: parseFloat(pForm.precio),
        stock: parseInt(pForm.stock),
        categoryId: parseInt(pForm.categoryId),
        imagenUrl: pForm.imagenUrl || undefined,
      };
      if (editingP) {
        const p = await api<Product>(`/products/${editingP}`, { method: "PATCH", body });
        setProducts((prev) => prev.map((x) => (x.id === editingP ? { ...x, ...p } : x)));
        notify("Producto actualizado");
      } else {
        const p = await api<Product>("/products", { method: "POST", body });
        setProducts((prev) => [{ ...p, category: categories.find(c => c.id === p.category?.id)! as any, precioFinal: p.precio, oferta: null }, ...prev]);
        notify("Producto creado");
      }
      setPForm({ nombre: "", descripcion: "", precio: "", stock: "", categoryId: "", imagenUrl: "" });
      setEditingP(null);
    } catch (e: any) { notify(e.message, true); }
  }

  async function updatePrecio(id: number) {
    const precio = parseFloat(editPrecio[id]);
    if (isNaN(precio)) return;
    await api(`/products/${id}`, { method: "PATCH", body: { precio } });
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, precio, precioFinal: precio } : p));
    setEditPrecio((prev) => { const n = { ...prev }; delete n[id]; return n; });
    notify("Precio actualizado");
  }

  async function deleteProduct(id: number) {
    if (!confirm("¿Eliminás el producto?")) return;
    await api(`/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
    notify("Producto eliminado");
  }

  async function saveCategory(e: React.FormEvent) {
    e.preventDefault();
    try {
      const c = await api<Category>("/categories", { method: "POST", body: catForm });
      setCategories((prev) => [...prev, c]);
      setCatForm({ nombre: "", slug: "", icono: "" });
      notify("Categoría creada");
    } catch (e: any) { notify(e.message, true); }
  }

  async function deleteCategory(id: number) {
    if (!confirm("¿Eliminás la categoría?")) return;
    await api(`/categories/${id}`, { method: "DELETE" });
    setCategories((prev) => prev.filter((c) => c.id !== id));
    notify("Categoría eliminada");
  }

  async function saveOffer(e: React.FormEvent) {
    e.preventDefault();
    try {
      const o = await api<Offer>("/offers", {
        method: "POST",
        body: {
          productId: parseInt(oForm.productId),
          porcentaje: parseFloat(oForm.porcentaje),
          fechaFin: new Date(oForm.fechaFin).toISOString(),
          esImperdible: oForm.esImperdible,
        },
      });
      setOffers((prev) => [o, ...prev]);
      setOForm({ productId: "", porcentaje: "", fechaFin: "", esImperdible: false });
      notify("Oferta creada");
    } catch (e: any) { notify(e.message, true); }
  }

  async function deactivateOffer(id: number) {
    await api(`/offers/${id}/desactivar`, { method: "PATCH" });
    setOffers((prev) => prev.filter((o) => o.id !== id));
    notify("Oferta dada de baja");
  }

  async function cambiarEstadoPedido(id: number, estado: string) {
    await api(`/orders/${id}/estado`, { method: "PATCH", body: { estado } });
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, estado: estado as any } : o));
    notify("Estado actualizado");
  }

  return (
    <div className="container">
      <h2 className="section-title">⚙️ Panel de Administración</h2>

      {msg && <div className="success-msg">{msg}</div>}
      {err && <div className="error-msg">{err}</div>}

      <div className="admin-tabs">
        {(["productos", "categorias", "ofertas", "pedidos"] as Tab[]).map((t) => (
          <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
            {t === "productos" ? "📦 Productos" :
             t === "categorias" ? "🗂 Categorías" :
             t === "ofertas" ? "🔥 Ofertas" : "🧾 Pedidos"}
          </button>
        ))}
      </div>

      {/* ============ PRODUCTOS ============ */}
      {tab === "productos" && (
        <>
          <div className="admin-form">
            <h3 style={{ marginBottom: 12 }}>{editingP ? "Editar producto" : "Nuevo producto"}</h3>
            <form onSubmit={saveProduct}>
              <div className="admin-form-row">
                <div className="form-group">
                  <label>Nombre *</label>
                  <input value={pForm.nombre} onChange={(e) => setPForm({ ...pForm, nombre: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Precio *</label>
                  <input type="number" min="0" step="0.01" value={pForm.precio} onChange={(e) => setPForm({ ...pForm, precio: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Stock *</label>
                  <input type="number" min="0" value={pForm.stock} onChange={(e) => setPForm({ ...pForm, stock: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Categoría *</label>
                  <select value={pForm.categoryId} onChange={(e) => setPForm({ ...pForm, categoryId: e.target.value })} required>
                    <option value="">Elegir…</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <input value={pForm.descripcion} onChange={(e) => setPForm({ ...pForm, descripcion: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>URL imagen</label>
                  <input type="url" value={pForm.imagenUrl} onChange={(e) => setPForm({ ...pForm, imagenUrl: e.target.value })} placeholder="https://…" />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button type="submit" className="btn-primary" style={{ maxWidth: 160 }}>
                  {editingP ? "Actualizar" : "Crear producto"}
                </button>
                {editingP && (
                  <button type="button" className="btn-secondary" onClick={() => { setEditingP(null); setPForm({ nombre: "", descripcion: "", precio: "", stock: "", categoryId: "", imagenUrl: "" }); }}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          <table className="admin-table">
            <thead>
              <tr><th>ID</th><th>Nombre</th><th>Categoría</th><th>Precio actual</th><th>Precio nuevo</th><th>Stock</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>#{p.id}</td>
                  <td>{p.nombre}</td>
                  <td>{p.category?.icono} {p.category?.nombre}</td>
                  <td>{formatPrice(p.precio)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <input
                        type="number"
                        style={{ width: 80, padding: "4px 6px", border: "1px solid #ccc", borderRadius: 4, fontSize: 13 }}
                        placeholder={String(p.precio)}
                        value={editPrecio[p.id] ?? ""}
                        onChange={(e) => setEditPrecio({ ...editPrecio, [p.id]: e.target.value })}
                      />
                      {editPrecio[p.id] && (
                        <button className="btn-yellow" style={{ padding: "4px 8px", fontSize: 12 }} onClick={() => updatePrecio(p.id)}>✓</button>
                      )}
                    </div>
                  </td>
                  <td style={{ color: p.stock === 0 ? "#f23d4f" : p.stock <= 5 ? "#e6a817" : "#333" }}>
                    {p.stock}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn-secondary" style={{ padding: "4px 10px", fontSize: 12 }}
                        onClick={() => { setEditingP(p.id); setPForm({ nombre: p.nombre, descripcion: p.descripcion ?? "", precio: String(p.precio), stock: String(p.stock), categoryId: String(p.category?.id ?? ""), imagenUrl: p.imagenUrl ?? "" }); setTab("productos"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                        ✏️
                      </button>
                      <button className="btn-danger" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => deleteProduct(p.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* ============ CATEGORÍAS ============ */}
      {tab === "categorias" && (
        <>
          <div className="admin-form">
            <h3 style={{ marginBottom: 12 }}>Nueva categoría</h3>
            <form onSubmit={saveCategory}>
              <div className="admin-form-row">
                <div className="form-group">
                  <label>Nombre *</label>
                  <input value={catForm.nombre} onChange={(e) => setCatForm({ ...catForm, nombre: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Slug * (ej: bebidas)</label>
                  <input value={catForm.slug} onChange={(e) => setCatForm({ ...catForm, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })} required />
                </div>
                <div className="form-group">
                  <label>Ícono (emoji)</label>
                  <input value={catForm.icono} onChange={(e) => setCatForm({ ...catForm, icono: e.target.value })} placeholder="🥫" />
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: 8, maxWidth: 160 }}>Crear categoría</button>
            </form>
          </div>

          <table className="admin-table">
            <thead><tr><th>ID</th><th>Ícono</th><th>Nombre</th><th>Slug</th><th>Productos</th><th></th></tr></thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td>#{c.id}</td>
                  <td style={{ fontSize: 22 }}>{c.icono}</td>
                  <td>{c.nombre}</td>
                  <td><code style={{ fontSize: 12 }}>{c.slug}</code></td>
                  <td>{c._count?.productos ?? "—"}</td>
                  <td><button className="btn-danger" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => deleteCategory(c.id)}>🗑</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* ============ OFERTAS ============ */}
      {tab === "ofertas" && (
        <>
          <div className="admin-form">
            <h3 style={{ marginBottom: 12 }}>Nueva oferta</h3>
            <form onSubmit={saveOffer}>
              <div className="admin-form-row">
                <div className="form-group">
                  <label>Producto *</label>
                  <select value={oForm.productId} onChange={(e) => setOForm({ ...oForm, productId: e.target.value })} required>
                    <option value="">Elegir producto…</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>% Descuento *</label>
                  <input type="number" min="1" max="95" value={oForm.porcentaje} onChange={(e) => setOForm({ ...oForm, porcentaje: e.target.value })} required placeholder="ej: 25" />
                </div>
                <div className="form-group">
                  <label>Válida hasta *</label>
                  <input type="date" value={oForm.fechaFin} onChange={(e) => setOForm({ ...oForm, fechaFin: e.target.value })} required />
                </div>
                <div className="form-group" style={{ justifyContent: "flex-end", display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" id="imper" checked={oForm.esImperdible} onChange={(e) => setOForm({ ...oForm, esImperdible: e.target.checked })} />
                  <label htmlFor="imper">🔥 Imperdible</label>
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: 8, maxWidth: 160 }}>Crear oferta</button>
            </form>
          </div>

          <table className="admin-table">
            <thead><tr><th>Producto</th><th>Descuento</th><th>Válida hasta</th><th>Imperdible</th><th></th></tr></thead>
            <tbody>
              {offers.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", color: "#999" }}>No hay ofertas activas</td></tr>
              ) : offers.map((o) => (
                <tr key={o.id}>
                  <td>{o.product?.nombre}</td>
                  <td><strong style={{ color: "#00a650" }}>{o.porcentaje}% OFF</strong></td>
                  <td>{new Date(o.fechaFin).toLocaleDateString("es-AR")}</td>
                  <td>{o.esImperdible ? "🔥 Sí" : "—"}</td>
                  <td><button className="btn-danger" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => deactivateOffer(o.id)}>Dar de baja</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* ============ PEDIDOS ============ */}
      {tab === "pedidos" && (
        <table className="admin-table">
          <thead><tr><th>#</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Pago</th><th>Estado</th><th>Cambiar</th></tr></thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: "center", color: "#999" }}>Sin pedidos</td></tr>
            ) : orders.map((o) => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>{o.user?.nombre}<br /><span style={{ fontSize: 11, color: "#999" }}>{o.user?.email}</span></td>
                <td style={{ fontSize: 12 }}>{new Date(o.fechaPago).toLocaleDateString("es-AR")}</td>
                <td>{formatPrice(o.montoFinal)}</td>
                <td>{o.metodoPago}</td>
                <td><span className={`status-pill ${o.estado.toLowerCase()}`}>{o.estado}</span></td>
                <td>
                  <select
                    value={o.estado}
                    style={{ fontSize: 12, padding: "4px 6px", borderRadius: 4, border: "1px solid #ccc" }}
                    onChange={(e) => cambiarEstadoPedido(o.id, e.target.value)}
                  >
                    {ESTADOS_ORDER.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
