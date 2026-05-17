import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useState } from "react";

export function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate(`/?q=${encodeURIComponent(search)}`);
  }

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">
          <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
          <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.85, letterSpacing: 1 }}>
            AUTOSERVICIO
          </span>
          <span style={{ fontSize: 22, fontWeight: 800 }}>
            El 🛒 Chanquito
          </span>
          </span>
        </Link>

        <form className="search-bar" onSubmit={onSearch}>
          <input
            type="text"
            placeholder="Buscar productos…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" aria-label="Buscar">🔍</button>
        </form>

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
                  <Link to="/cuenta">Mi cuenta</Link>
                </>
              )}

              <Link to="/cart" className="cart-btn">
                🛒
                {itemCount > 0 && (
                  <span className="cart-badge">{itemCount}</span>
                )}
              </Link>

              <button
                onClick={() => { logout(); navigate("/"); }}
                className="btn-ghost"
              >
                Salir
              </button>
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
