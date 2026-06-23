import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { offerCreateSchema } from "../utils/validators";
import { HttpError } from "../middlewares/errorHandler";

export async function listOffers(_req: Request, res: Response, next: NextFunction) {
  try {
    const offers = await prisma.offer.findMany({
      where: { activa: true, fechaFin: { gt: new Date() } },
      include: { product: { include: { category: true } } },
      orderBy: { porcentaje: "desc" },
    });
    res.json(offers);
  } catch (e) {
    next(e);
  }
}

export async function createOffer(req: Request, res: Response, next: NextFunction) {
  try {
    const data = offerCreateSchema.parse(req.body);
    const o = await prisma.offer.create({
      data: {
        productId: data.productId,
        porcentaje: data.porcentaje,
        fechaFin: new Date(data.fechaFin),
        esImperdible: data.esImperdible ?? false,
        activa: true,
      },
    });
    res.status(201).json(o);
  } catch (e) {
    next(e);
  }
}

export async function deactivateOffer(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const o = await prisma.offer.update({
      where: { id },
      data: { activa: false },
    });
    res.json(o);
  } catch (e) {
    next(e);
  }
}

export async function deleteOffer(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await prisma.offer.delete({ where: { id } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
}
