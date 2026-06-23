import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { useCart } from "../context/CartContext";
import { Loader } from "../components/Loader";

interface VerifyResult {
  orderId: number;
  estado: string;
  aprobado?: boolean;
  ya?: boolean;
}

export function CheckoutResult() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refresh } = useCart();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState("");

  const orderId = params.get("order");
  const status = params.get("status");
  const paymentId = params.get("payment_id");

  useEffect(() => {
    if (!orderId) {
      setError("Falta el ID del pedido");
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const qs = paymentId ? `?payment_id=${paymentId}` : "";
        const r = await api<VerifyResult>(`/orders/${orderId}/verificar-pago${qs}`);
        setResult(r);
        await refresh();
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [orderId, paymentId]);

  if (loading) return (
    <div className="container">
      <Loader text="Confirmando tu pago con Mercado Pago..." />
    </div>
  );

  const aprobado = status === "success" || result?.aprobado;
  const rechazado = status === "failure" || result?.estado === "CANCELADO";

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="text-center">
          {aprobado ? (
            <>
              <div style={{ fontSize: 70 }}>🎉</div>
              <h2 style={{ color: "var(--ml-green)", marginTop: 12 }}>¡Pago aprobado!</h2>
              <p className="muted" style={{ marginTop: 8 }}>
                Tu pedido #{result?.orderId ?? orderId} está confirmado.
              </p>
            </>
          ) : rechazado ? (
            <>
              <div style={{ fontSize: 70 }}>😕</div>
              <h2 style={{ color: "var(--ml-red)", marginTop: 12 }}>Pago rechazado</h2>
              <p className="muted" style={{ marginTop: 8 }}>
                No se pudo procesar el pago. Probá con otro medio.
              </p>
            </>
          ) : (
            <>
              <div style={{ fontSize: 70 }}>⏳</div>
              <h2 style={{ marginTop: 12 }}>Pago pendiente</h2>
              <p className="muted" style={{ marginTop: 8 }}>
                Tu pago está siendo procesado. Te avisamos cuando se confirme.
              </p>
            </>
          )}

          {error && <div className="error-msg mt-3">{error}</div>}

          <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "center" }}>
            <Link to="/mis-pedidos" className="btn-primary" style={{ flex: 1, textAlign: "center", textDecoration: "none" }}>
              Ver mis pedidos
            </Link>
            <button className="btn-secondary" onClick={() => navigate("/")} style={{ flex: 1 }}>
              Seguir comprando
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
