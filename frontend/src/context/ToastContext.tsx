import { createContext, useCallback, useContext, useState, ReactNode } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  desc?: string;
  action?: { label: string; onClick: () => void };
}

interface ToastContextValue {
  show: (toast: Omit<Toast, "id">) => void;
  success: (title: string, desc?: string, action?: Toast["action"]) => void;
  error: (title: string, desc?: string) => void;
  info: (title: string, desc?: string) => void;
}

const ToastCtx = createContext<ToastContextValue | null>(null);

let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [leaving, setLeaving] = useState<Set<number>>(new Set());

  const remove = useCallback((id: number) => {
    setLeaving((s) => new Set(s).add(id));
    setTimeout(() => {
      setToasts((arr) => arr.filter((t) => t.id !== id));
      setLeaving((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
    }, 200);
  }, []);

  const show = useCallback((toast: Omit<Toast, "id">) => {
    const id = ++counter;
    setToasts((arr) => [...arr, { ...toast, id }]);
    setTimeout(() => remove(id), 4000);
  }, [remove]);

  const success = (title: string, desc?: string, action?: Toast["action"]) =>
    show({ type: "success", title, desc, action });
  const error = (title: string, desc?: string) =>
    show({ type: "error", title, desc });
  const info = (title: string, desc?: string) =>
    show({ type: "info", title, desc });

  const ICONS: Record<ToastType, string> = {
    success: "✅",
    error: "❌",
    info: "ℹ️",
  };

  return (
    <ToastCtx.Provider value={{ show, success, error, info }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type} ${leaving.has(t.id) ? "leaving" : ""}`}>
            <span className="icon">{ICONS[t.type]}</span>
            <div className="content">
              <div className="title">{t.title}</div>
              {t.desc && <div className="desc">{t.desc}</div>}
            </div>
            {t.action && (
              <button className="action" onClick={() => { t.action!.onClick(); remove(t.id); }}>
                {t.action.label}
              </button>
            )}
            <button className="close" onClick={() => remove(t.id)}>×</button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast fuera de ToastProvider");
  return ctx;
}
