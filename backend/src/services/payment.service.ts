import QRCode from "qrcode";

export type MetodoPago = "QR" | "DEBITO" | "CREDITO";

/**
 * Simula una pasarela de pagos. En un futuro acá iría la integración
 * con Mercado Pago, Stripe, etc.
 *
 * - QR: genera un QR estático con el monto.
 * - DEBITO/CREDITO: simula aprobación con probabilidad alta.
 */
export async function procesarPago(
  metodo: MetodoPago,
  monto: number,
  referencia: string
): Promise<{ ok: boolean; comprobante: string; qr?: string }> {
  if (metodo === "QR") {
    const payload = `autoservicio://pago/${referencia}/${monto.toFixed(2)}`;
    const qr = await QRCode.toDataURL(payload);
    return { ok: true, comprobante: `QR-${referencia}-${Date.now()}`, qr };
  }

  // Simulación: rechazo aleatorio del 5%
  const aprobado = Math.random() > 0.05;
  if (!aprobado) {
    return { ok: false, comprobante: "" };
  }
  const prefijo = metodo === "DEBITO" ? "DB" : "CR";
  return { ok: true, comprobante: `${prefijo}-${referencia}-${Date.now()}` };
}
