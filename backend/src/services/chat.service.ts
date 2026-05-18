/* ============================================================
 * SERVICIO DE CHATBOT / ASISTENTE
 * ------------------------------------------------------------
 * Base lista para conectar con un proveedor de IA:
 *   - OpenAI (GPT-4o-mini, GPT-4)
 *   - Anthropic (Claude Haiku, Sonnet)
 *   - Groq (free tier rapidísimo)
 *
 * Por ahora responde con un FAQ matcher simple basado en
 * keywords. Si está configurada la API key de IA, usa el
 * proveedor real.
 * ============================================================ */

interface ChatRequest {
  message: string;
  history?: { role: "user" | "assistant"; content: string }[];
}

interface ChatResponse {
  reply: string;
  source: "faq" | "ai";
}

const FAQS: { keywords: string[]; respuesta: string }[] = [
  {
    keywords: ["envío", "envio", "entrega", "envían", "envian"],
    respuesta: "Hacemos envíos a todo el país. Si tenés el plan **Plus** el envío es gratis, con **Estándar** tenés 25% off y con **Básico** 10% off.",
  },
  {
    keywords: ["pago", "pagar", "tarjeta", "mercado pago", "mp"],
    respuesta: "Aceptamos pagos por **Mercado Pago** (tarjeta de crédito/débito, transferencia, efectivo en Rapipago) y código QR. El pago con MP es totalmente seguro y se procesa en su plataforma.",
  },
  {
    keywords: ["descuento", "descuentos", "oferta", "ofertas"],
    respuesta: "Tenemos varios descuentos:\n• 21% si sos jubilado/a\n• 15% si sos estudiante\n• 50% si tenés plan **Plus**\nAdemás hay ofertas imperdibles cada semana en la home.",
  },
  {
    keywords: ["suscripción", "suscripcion", "plan", "planes"],
    respuesta: "Tenemos 3 planes:\n• **Básico** ($2.500/mes) — 10% off en envíos\n• **Estándar** ($4.500/mes) — 25% off en envíos\n• **Plus** ($75.000/año) — 50% off en productos + envío gratis",
  },
  {
    keywords: ["devolución", "devolucion", "devolver", "cambio"],
    respuesta: "Podés devolver cualquier producto sin abrir hasta 7 días después de la compra. Escribinos desde tu pedido en la sección **Mis pedidos**.",
  },
  {
    keywords: ["jubilado", "jubilada", "tercera edad"],
    respuesta: "Si sos jubilado/a tenés un **21% de descuento** automático en todos los productos. Solo tildalo al registrarte o desde tu perfil.",
  },
  {
    keywords: ["estudiante"],
    respuesta: "Si sos estudiante tenés un **15% de descuento** automático. Tildalo al registrarte o desde Mi cuenta.",
  },
  {
    keywords: ["2fa", "dos pasos", "autenticador", "seguridad"],
    respuesta: "Podés activar autenticación en 2 pasos desde **Mi cuenta**. Te genera un QR para escanear con Google Authenticator o Authy.",
  },
  {
    keywords: ["hola", "buenas", "buen día", "buen dia", "buenos dias"],
    respuesta: "¡Hola! Soy el asistente de Changuito 🛒 ¿En qué te puedo ayudar? Podés preguntarme sobre envíos, pagos, descuentos o suscripciones.",
  },
];

function matchFAQ(message: string): string | null {
  const lower = message.toLowerCase();
  for (const faq of FAQS) {
    if (faq.keywords.some((k) => lower.includes(k))) {
      return faq.respuesta;
    }
  }
  return null;
}

/**
 * Conecta acá tu proveedor de IA preferido.
 * Ejemplo con Anthropic Claude:
 *
 *   const Anthropic = require("@anthropic-ai/sdk");
 *   const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
 *   const msg = await client.messages.create({
 *     model: "claude-haiku-4-5",
 *     max_tokens: 400,
 *     system: "Sos el asistente de Changuito, un autoservicio online argentino. Sé amable y conciso.",
 *     messages: [...history, { role: "user", content: message }]
 *   });
 *   return msg.content[0].text;
 */
async function llamarIA(_request: ChatRequest): Promise<string | null> {
  // TODO: conectar acá la API de IA. Por ahora retorna null para usar FAQs.
  // Ejemplo:
  //   if (!process.env.ANTHROPIC_API_KEY) return null;
  //   return await callClaude(_request);
  return null;
}

export async function responder(req: ChatRequest): Promise<ChatResponse> {
  const aiReply = await llamarIA(req);
  if (aiReply) return { reply: aiReply, source: "ai" };

  const faq = matchFAQ(req.message);
  if (faq) return { reply: faq, source: "faq" };

  return {
    reply: "No estoy seguro de cómo ayudarte con eso 😅 Probá preguntarme sobre **envíos**, **pagos**, **descuentos**, **suscripciones** o **devoluciones**.",
    source: "faq",
  };
}
