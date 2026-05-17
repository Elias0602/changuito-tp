import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "../api/client";
import { Cart } from "../types";
import { useAuth } from "./AuthContext";

interface CartState {
  cart: Cart | null;
  loading: boolean;
  itemCount: number;
  refresh: () => Promise<void>;
  add: (productId: number, cantidad?: number) => Promise<void>;
  update: (itemId: number, cantidad: number) => Promise<void>;
  remove: (itemId: number) => Promise<void>;
  clear: () => Promise<void>;
}

const CartCtx = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user || user.role !== "CUSTOMER") {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const c = await api<Cart>("/cart");
      setCart(c);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function add(productId: number, cantidad = 1) {
    await api("/cart/items", { method: "POST", body: { productId, cantidad } });
    await refresh();
  }

  async function update(itemId: number, cantidad: number) {
    await api(`/cart/items/${itemId}`, { method: "PATCH", body: { cantidad } });
    await refresh();
  }

  async function remove(itemId: number) {
    await api(`/cart/items/${itemId}`, { method: "DELETE" });
    await refresh();
  }

  async function clear() {
    await api("/cart", { method: "DELETE" });
    await refresh();
  }

  const itemCount = cart?.items.reduce((acc, it) => acc + it.cantidad, 0) ?? 0;

  return (
    <CartCtx.Provider value={{ cart, loading, itemCount, refresh, add, update, remove, clear }}>
      {children}
    </CartCtx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart fuera de CartProvider");
  return ctx;
}
