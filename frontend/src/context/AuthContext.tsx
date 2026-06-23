import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, clearToken, getToken, setToken } from "../api/client";
import { User } from "../types";

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ twoFactorRequired: boolean; userId?: number }>;
  verify2FA: (userId: number, token: string) => Promise<void>;
  register: (data: {
    nombre: string;
    email: string;
    password: string;
    esJubilado?: boolean;
    esEstudiante?: boolean;
  }) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api<{ user: User }>("/auth/me");
      setUser(data.user);
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function login(email: string, password: string) {
    const res = await api<{
      twoFactorRequired: boolean;
      userId?: number;
      token?: string;
      user?: User;
    }>("/auth/login", { method: "POST", body: { email, password } });

    if (res.twoFactorRequired) {
      return { twoFactorRequired: true, userId: res.userId };
    }
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
    }
    return { twoFactorRequired: false };
  }

  async function verify2FA(userId: number, token: string) {
    const res = await api<{ token: string; user: User }>("/auth/2fa/verify-login", {
      method: "POST",
      body: { userId, token },
    });
    setToken(res.token);
    setUser(res.user);
  }

  async function register(data: {
    nombre: string;
    email: string;
    password: string;
    esJubilado?: boolean;
    esEstudiante?: boolean;
  }) {
    const res = await api<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: data,
    });
    setToken(res.token);
    setUser(res.user);
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  return (
    <AuthCtx.Provider value={{ user, loading, login, verify2FA, register, logout, refresh }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth fuera de AuthProvider");
  return ctx;
}
