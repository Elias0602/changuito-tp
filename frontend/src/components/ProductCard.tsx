import { Link, useNavigate } from "react-router-dom";
import { Product } from "../types";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { ProductImage } from "./ProductImage";
import { useToast } from "../context/ToastContext";

export function formatPrice(n: number): string {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

export function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [state, setState] = useState<"idle" | "adding" | "added">("idle");

  async function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }
    setState("adding");
    try {
      await add(p.id, 1);
      setState("added");
      toast.success(
        "Producto agregado",
        p.nombre,
        { label: "Ver carrito", onClick: () => navigate("/cart") }
      );
      setTimeout(() => setState("idle"), 1200);
    } catch (err: any) {
      setState("idle");
      toast.error("No se pudo agregar", err.message);
    }
  }

  const hasOffer = p.oferta && p.precioFinal < p.precio;
  const stockBajo = p.stock > 0 && p.stock <= 5;

  return (
    <Link to={`/producto/${p.id}`} className="product-card" style={{ textDecoration: "none", color: "inherit" }}>
      {p.oferta?.esImperdible && <span className="badge-imperdible">🔥 Imperdible</span>}
      <ProductImage
        nombre={p.nombre}
        imagenUrl={p.imagenUrl}
        categoria={p.category}
        className="product-img"
      />
      <div className="product-body">
        <div className="product-name">{p.nombre}</div>

        {hasOffer && <div className="product-price-old">{formatPrice(p.precio)}</div>}
        <div className="product-price">
          {formatPrice(p.precioFinal)}
          {hasOffer && <span className="product-discount">{p.oferta!.porcentaje}% OFF</span>}
        </div>

        <div className="product-free-shipping">Envío gratis con suscripción</div>

        {p.stock === 0 ? (
          <div className="product-stock-low">Sin stock</div>
        ) : stockBajo ? (
          <div className="product-stock-low">¡Últimas {p.stock} unidades!</div>
        ) : null}

        <button
          className={`btn-add ${state === "added" ? "added" : ""}`}
          onClick={handleAdd}
          disabled={state !== "idle" || p.stock === 0}
        >
          {state === "adding" ? "Agregando…" :
           state === "added" ? "✓ Agregado" :
           p.stock === 0 ? "Sin stock" : "Agregar"}
        </button>
      </div>
    </Link>
  );
}
