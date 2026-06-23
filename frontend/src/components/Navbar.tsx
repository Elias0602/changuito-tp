import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import { Product } from "../types";

export function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount, bumpCounter } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [bump, setBump] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const debounceRef = useRef<number>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Bounce del badge cuando se incrementa
  useEffect(() => {
    if (bumpCounter === 0) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 500);
    return () => clearTimeout(t);
  }, [bumpCounter]);

  // Debounce de la búsqueda
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (search.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = window.setTimeout(async () => {
      try {
        const data = await api<Product[]>(`/products?search=${encodeURIComponent(search)}`);
        setSuggestions(data.slice(0, 6));
      } catch {
        setSuggestions([]);
      }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // Cerrar sugerencias al click fuera
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggest(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setShowSuggest(false);
    navigate(`/?q=${encodeURIComponent(search)}`);
  }

  function goToProduct(p: Product) {
    setShowSuggest(false);
    setSearch("");
    navigate(`/producto/${p.id}`);
  }

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">
          <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.85, letterSpacing: 1 }}>AUTOSERVICIO</span>
            <span style={{ fontSize: 22, fontWeight: 800 }}>El 🛒Changuito</span>
          </span>
        </Link>

        <div className="search-wrapper" ref={wrapperRef}>
          <form className="search-bar" onSubmit={onSearch}>
            <input
              type="text"
              placeholder="Buscar productos…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowSuggest(true); }}
              onFocus={() => setShowSuggest(true)}
            />
            <button type="submit" aria-label="Buscar">🔍</button>
          </form>

          {showSuggest && suggestions.length > 0 && (
            <div className="search-suggestions">
              {suggestions.map((p) => (
                <div key={p.id} className="search-suggestion-item" onClick={() => goToProduct(p)}>
                  <span style={{ fontSize: 24 }}>{p.category?.icono || "🛒"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{p.nombre}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      ${p.precioFinal.toLocaleString("es-AR")}
                      {p.oferta && <span style={{ color: "#00a650", marginLeft: 8 }}>{p.oferta.porcentaje}% OFF</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="header-actions">
          {user ? (
            <>
              <span>Hola, <strong>{user.nombre.split(" ")[0]}</strong></span>
              {user.role === "ADMIN" && <Link to="/admin">Panel admin</Link>}
              {user.role === "RESTOCKER" && <Link to="/repositor">Mi panel</Link>}
              {user.role === "CUSTOMER" && (
                <>
                  <Link to="/suscripciones">Suscripciones</Link>
                  <Link to="/mis-pedidos">Mis pedidos</Link>
                  <Link to="/direcciones">Direcciones</Link>
                  <Link to="/cuenta">Mi cuenta</Link>
                </>
              )}
              <Link to="/cart" className="cart-btn">
                🛒
                {itemCount > 0 && (
                  <span className={`cart-badge ${bump ? "bounce" : ""}`}>{itemCount}</span>
                )}
              </Link>
              <button onClick={() => { logout(); navigate("/"); }} className="btn-ghost">Salir</button>
            </>
          ) : (
            <>
              <Link to="/register">Crear cuenta</Link>
              <Link to="/login">Ingresar</Link>
              <Link to="/cart" className="cart-btn">🛒</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
