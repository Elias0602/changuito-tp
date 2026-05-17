import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";
import { Product } from "../types";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../components/ProductCard";
import { ProductImage } from "../components/ProductImage";

export function ProductDetail() {
  const { id } = useParams();
  const [p, setP] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const { add } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api<Product>(`/products/${id}`)
      .then(setP)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container"><div className="spinner" /></div>;
  if (!p) return <div className="container"><div className="empty">Producto no encontrado</div></div>;

  const hasOffer = p.oferta && p.precioFinal < p.precio;

  async function handleAdd() {
    if (!user) return navigate("/login");
    setAdding(true);
    try {
      await add(p!.id, qty);
      navigate("/cart");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="container">
      <div style={{ marginBottom: 12, fontSize: 13 }}>
        <Link to="/">← Volver</Link>
      </div>

      <div className="detail-layout">
        <ProductImage
          nombre={p.nombre}
          imagenUrl={p.imagenUrl}
          categoria={p.category}
          className="detail-img"
        />

        <div>
          {p.oferta?.esImperdible && (
            <span style={{ background: "#f23d4f", color: "white", padding: "3px 8px", fontSize: 11, fontWeight: 700, borderRadius: 2 }}>
              🔥 OFERTA IMPERDIBLE
            </span>
          )}
          <h1 className="detail-title">{p.nombre}</h1>
          <div className="muted" style={{ fontSize: 13 }}>en {p.category.nombre}</div>

          {hasOffer && (
            <div className="product-price-old" style={{ marginTop: 16, fontSize: 16 }}>
              {formatPrice(p.precio)}
            </div>
          )}
          <div className="detail-price">
            {formatPrice(p.precioFinal)}
            {hasOffer && (
              <span style={{ color: "#00a650", fontSize: 18, fontWeight: 600, marginLeft: 10 }}>
                {p.oferta!.porcentaje}% OFF
              </span>
            )}
          </div>

          {p.descripcion && (
            <p style={{ marginTop: 16, color: "#666" }}>{p.descripcion}</p>
          )}

          <div style={{ marginTop: 24 }}>
            <strong>Stock:</strong>{" "}
            {p.stock === 0 ? (
              <span style={{ color: "#f23d4f" }}>Sin stock</span>
            ) : p.stock <= 5 ? (
              <span style={{ color: "#f23d4f" }}>¡Sólo {p.stock} disponibles!</span>
            ) : (
              <span style={{ color: "#00a650" }}>Stock disponible</span>
            )}
          </div>

          {p.stock > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ marginBottom: 10 }}>
                <strong>Cantidad:</strong>{" "}
                <div className="qty-input" style={{ display: "inline-flex", marginLeft: 10 }}>
                  <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(Math.min(p.stock, qty + 1))}>+</button>
                </div>
                <span className="muted" style={{ marginLeft: 8 }}>({p.stock} disponibles)</span>
              </div>

              <button className="btn-primary" onClick={handleAdd} disabled={adding} style={{ maxWidth: 280 }}>
                {adding ? "Agregando…" : "Agregar al carrito"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
