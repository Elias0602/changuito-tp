import { prisma } from "../config/prisma";

export interface DiscountInfo {
  porcentaje: number;          // descuento en productos
  motivos: string[];
  envioGratis: boolean;
  descuentoEnvio: number;      // % de descuento en el envío (0-100)
}

export async function calcularDescuento(userId: number): Promise<DiscountInfo> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptions: {
        where: { activa: true, fechaVencimiento: { gt: new Date() } },
        orderBy: { fechaVencimiento: "desc" },
        take: 1,
      },
    },
  });

  if (!user) {
    return { porcentaje: 0, motivos: [], envioGratis: false, descuentoEnvio: 0 };
  }

  const sub = user.subscriptions[0];

  // Descuento en productos
  const opciones: { porc: number; motivo: string }[] = [];

  if (sub?.plan === "PLUS") {
    opciones.push({ porc: 50, motivo: "Plan Plus (-50%)" });
  }
  if (user.esJubilado) opciones.push({ porc: 21, motivo: "Jubilado/a (-21%)" });
  if (user.esEstudiante) opciones.push({ porc: 15, motivo: "Estudiante (-15%)" });

  const mejor = opciones.length > 0
    ? opciones.reduce((a, b) => (b.porc > a.porc ? b : a))
    : null;

  // Descuento en envío según plan
  let envioGratis = false;
  let descuentoEnvio = 0;
  const motivos = mejor ? [mejor.motivo] : [];

  if (sub?.plan === "PLUS") {
    envioGratis = true;
    descuentoEnvio = 100;
    if (!motivos.includes("Plan Plus (-50%)")) motivos.push("Envío gratis con Plus");
  } else if (sub?.plan === "ESTANDAR") {
    descuentoEnvio = 25;
    motivos.push("Plan Estándar (-25% en envíos)");
  } else if (sub?.plan === "BASICO") {
    descuentoEnvio = 10;
    motivos.push("Plan Básico (-10% en envíos)");
  }

  return {
    porcentaje: mejor?.porc ?? 0,
    motivos,
    envioGratis,
    descuentoEnvio,
  };
}

export function aplicarOferta(precio: number, porcentaje?: number) {
  if (!porcentaje) return precio;
  return +(precio * (1 - porcentaje / 100)).toFixed(2);
}
