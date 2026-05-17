import { prisma } from "../config/prisma";

export interface DiscountInfo {
  porcentaje: number;
  motivos: string[];
  envioGratis: boolean;
}

export async function calcularDescuento(userId: number): Promise<DiscountInfo> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptions: {
        where: { activa: true, fechaVencimiento: { gt: new Date() } },
        take: 1,
      },
    },
  });

  if (!user) return { porcentaje: 0, motivos: [], envioGratis: false };

  const opciones: { porc: number; motivo: string }[] = [];
  let envioGratis = false;

  if (user.subscriptions.length > 0) {
    opciones.push({ porc: 50, motivo: "Suscriptor activo (-50%)" });
    envioGratis = true;
  }
  if (user.esJubilado) opciones.push({ porc: 21, motivo: "Jubilado/a (-21%)" });
  if (user.esEstudiante) opciones.push({ porc: 15, motivo: "Estudiante (-15%)" });

  if (!opciones.length) return { porcentaje: 0, motivos: [], envioGratis };

  const mejor = opciones.reduce((a, b) => (b.porc > a.porc ? b : a));
  return { porcentaje: mejor.porc, motivos: [mejor.motivo], envioGratis };
}

export function aplicarOferta(precio: number, porcentaje?: number) {
  if (!porcentaje) return precio;
  return +(precio * (1 - porcentaje / 100)).toFixed(2);
}
