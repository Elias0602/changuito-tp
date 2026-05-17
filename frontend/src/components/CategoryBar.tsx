import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { Category } from "../types";

export function CategoryBar() {
  const [cats, setCats] = useState<Category[]>([]);
  const [params] = useSearchParams();
  const activeId = params.get("cat");

  useEffect(() => {
    api<Category[]>("/categories").then(setCats).catch(() => setCats([]));
  }, []);

  return (
    <nav className="cat-bar">
      <div className="cat-bar-inner">
        <Link to="/" className={!activeId ? "active" : ""}>🏠 Todo</Link>
        {cats.map((c) => (
          <Link
            key={c.id}
            to={`/?cat=${c.id}`}
            className={activeId === String(c.id) ? "active" : ""}
          >
            {c.icono} {c.nombre}
          </Link>
        ))}
        <Link to="/?ofertas=1" className={params.get("ofertas") ? "active" : ""}>
          🔥 Ofertas
        </Link>
      </div>
    </nav>
  );
}
