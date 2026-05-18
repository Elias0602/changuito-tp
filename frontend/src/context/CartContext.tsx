import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "../api/client";
import { Cart } from "../types";
import { useAuth } from "./AuthContext";

interface CartState {
  cart: Cart | null;
  loading: boolean;
  itemCount: number;
  bumpCounter: number; // se incrementa cuando hay que animar el badge
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
  const [bumpCounter, setBumpCounter] = useState(0);

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
    // Optimistic: si ya está en el carrito, actualizamos la cantidad localmente
    if (cart) {
      const existing = cart.items.find((it) => it.productId === productId);
      if (existing) {
        setCart({
          ...cart,
          items: cart.items.map((it) =>
            it.productId === productId ? { ...it, cantidad: it.cantidad + cantidad } : it
          ),
        });
      }
    }
    setBumpCounter((c) => c + 1);
    await api("/cart/items", { method: "POST", body: { productId, cantidad } });
    await refresh();
  }

  async function update(itemId: number, cantidad: number) {
    if (cart) {
      setCart({
        ...cart,
        items: cantidad === 0
          ? cart.items.filter((it) => it.id !== itemId)
          : cart.items.map((it) => (it.id === itemId ? { ...it, cantidad } : it)),
      });
    }
    await api(`/cart/items/${itemId}`, { method: "PATCH", body: { cantidad } });
    await refresh();
  }

  async function remove(itemId: number) {
    if (cart) {
      setCart({ ...cart, items: cart.items.filter((it) => it.id !== itemId) });
    }
    await api(`/cart/items/${itemId}`, { method: "DELETE" });
    await refresh();
  }

  async function clear() {
    if (cart) setCart({ ...cart, items: [] });
    await api("/cart", { method: "DELETE" });
    await refresh();
  }

  const itemCount = cart?.items.reduce((acc, it) => acc + it.cantidad, 0) ?? 0;

  return (
    <CartCtx.Provider value={{ cart, loading, itemCount, bumpCounter, refresh, add, update, remove, clear }}>
      {children}
    </CartCtx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart fuera de CartProvider");
  return ctx;
}
