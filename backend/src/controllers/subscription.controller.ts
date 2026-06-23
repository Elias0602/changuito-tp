import { Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../types";
import { subscribeSchema } from "../utils/validators";
import { HttpError } from "../middlewares/errorHandler";

const PRECIOS: Record<string, { MENSUAL?: number; ANUAL?: number }> = {
  BASICO: { MENSUAL: 2500, ANUAL: 24000 },
  ESTANDAR: { MENSUAL: 4500, ANUAL: 43000 },
  PLUS: { ANUAL: 75000 }, // Solo anual
};

export async function planes(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json([
      {
        plan: "BASICO",
        nombre: "Básico",
        descripcion: "10% de descuento en envíos + soporte prioritario.",
        descuentoEnvio: 10,
        descuentoProductos: 0,
        envioGratis: false,
        mensual: PRECIOS.BASICO.MENSUAL,
        anual: PRECIOS.BASICO.ANUAL,
      },
      {
        plan: "ESTANDAR",
        nombre: "Estándar",
        descripcion: "25% de descuento en envíos + soporte prioritario.",
        descuentoEnvio: 25,
        descuentoProductos: 0,
        envioGratis: false,
        mensual: PRECIOS.ESTANDAR.MENSUAL,
        anual: PRECIOS.ESTANDAR.ANUAL,
      },
      {
        plan: "PLUS",
        nombre: "Plus",
        descripcion: "50% off en todos los productos + envío gratis ilimitado + soporte prioritario.",
        descuentoEnvio: 100,
        descuentoProductos: 50,
        envioGratis: true,
        mensual: null,
        anual: PRECIOS.PLUS.ANUAL,
      },
    ]);
  } catch (e) {
    next(e);
  }
}

export async function suscribirse(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { plan, periodo } = subscribeSchema.parse(req.body);

    if (plan === "PLUS" && periodo !== "ANUAL")
      throw new HttpError(400, "El plan Plus solo está disponible en modalidad anual");

    const precio = PRECIOS[plan][periodo];
    if (precio == null) throw new HttpError(400, "Combinación plan/período inválida");

    // Desactivar suscripciones previas
    await prisma.subscription.updateMany({
      where: { userId, activa: true },
      data: { activa: false },
    });

    const ahora = new Date();
    const vencimiento = new Date(ahora);
    if (periodo === "MENSUAL") vencimiento.setMonth(vencimiento.getMonth() + 1);
    else vencimiento.setFullYear(vencimiento.getFullYear() + 1);

    const sub = await prisma.subscription.create({
      data: {
        userId,
        plan,
        periodo,
        precio,
        fechaInicio: ahora,
        fechaVencimiento: vencimiento,
        activa: true,
      },
    });

    res.status(201).json(sub);
  } catch (e) {
    next(e);
  }
}

export async function miSuscripcion(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const sub = await prisma.subscription.findFirst({
      where: { userId, activa: true, fechaVencimiento: { gt: new Date() } },
      orderBy: { fechaVencimiento: "desc" },
    });
    res.json(sub);
  } catch (e) {
    next(e);
  }
}

export async function cancelarSuscripcion(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    await prisma.subscription.updateMany({
      where: { userId, activa: true },
      data: { activa: false },
    });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}
