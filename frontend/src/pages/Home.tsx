import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "../api/client";
import { Product } from "../types";
import { ProductCard } from "../components/ProductCard";

export function Home() {
  const [params] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [reco, setReco] = useState<{ imperdibles: Product[]; nuevos: Product[] } | null>(null);
  const [loading, setLoading] = useState(true);

  const q = params.get("q");
  const cat = params.get("cat");
  const onlyOffers = params.get("ofertas") === "1";

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (q) qs.set("search", q);
    if (cat) qs.set("categoryId", cat);
    if (onlyOffers) qs.set("onlyOffers", "true");

    api<Product[]>(`/products?${qs.toString()}`)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [q, cat, onlyOffers]);

  useEffect(() => {
    if (!q && !cat && !onlyOffers) {
      api<{ imperdibles: Product[]; nuevos: Product[] }>("/products/recomendaciones").then(setReco);
    } else {
      setReco(null);
    }
  }, [q, cat, onlyOffers]);

  const showHero = !q && !cat && !onlyOffers;

  return (
    <div className="container">
      {showHero && (
        <div className="hero">
          <div>
            <h1>Suscribite y ahorrá 50% en todas tus compras 🛒</h1>
            <p>Envíos gratis ilimitados, ofertas exclusivas y atención prioritaria. Probalo este mes.</p>
          </div>
          <Link to="/suscripciones" className="hero-cta">
            Ver planes →
          </Link>
        </div>
      )}

      {showHero && reco && reco.imperdibles.length > 0 && (
        <>
          <h2 className="section-title">🔥 Ofertas imperdibles</h2>
          <div className="product-grid">
            {reco.imperdibles.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </>
      )}

      <h2 className="section-title">
        {q ? `Resultados para "${q}"` :
         cat ? "Productos de la categoría" :
         onlyOffers ? "Todas las ofertas" :
         "Recién llegados"}
      </h2>

      {loading ? (
        <div className="spinner" />
      ) : products.length === 0 ? (
        <div className="empty">
          <div className="empty-emoji">🔍</div>
          <p>No se encontraron productos</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}
