import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

const accessToken = process.env.MP_ACCESS_TOKEN;
const client = accessToken
  ? new MercadoPagoConfig({ accessToken })
  : null;

export function mpDisponible() {
  return client !== null;
}

interface CrearPreferenciaInput {
  orderId: number;
  monto: number;
  descripcion: string;
  email: string;
  frontendUrl: string;
  backendUrl: string;
}

export async function crearPreferencia(input: CrearPreferenciaInput) {
  if (!client) throw new Error("Mercado Pago no está configurado");

  const preference = new Preference(client);
  const result = await preference.create({
    body: {
      items: [{
        id: String(input.orderId),
        title: input.descripcion,
        quantity: 1,
        unit_price: input.monto,
        currency_id: "ARS",
      }],
      payer: { email: input.email },
      back_urls: {
        success: `${input.frontendUrl}/checkout/result?order=${input.orderId}&status=success`,
        failure: `${input.frontendUrl}/checkout/result?order=${input.orderId}&status=failure`,
        pending: `${input.frontendUrl}/checkout/result?order=${input.orderId}&status=pending`,
      },
      auto_return: "approved",
      external_reference: String(input.orderId),
      notification_url: `${input.backendUrl}/api/orders/webhook/mp`,
    },
  });

  return {
    preferenceId: result.id,
    initPoint: result.init_point,
    sandboxInitPoint: result.sandbox_init_point,
  };
}

export async function obtenerEstadoPago(paymentId: string) {
  if (!client) throw new Error("Mercado Pago no está configurado");
  const payment = new Payment(client);
  const result = await payment.get({ id: paymentId });
  return {
    status: result.status,
    statusDetail: result.status_detail,
    externalReference: result.external_reference,
    amount: result.transaction_amount,
  };
}
