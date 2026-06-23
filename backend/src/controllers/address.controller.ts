import { Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../types";
import { HttpError } from "../middlewares/errorHandler";

/* ============================================================
 * MÓDULO DE DIRECCIONES DE ENVÍO
 * ------------------------------------------------------------
 * Base lista para que el módulo de envíos extienda:
 *  - Integrar Google Maps API o Leaflet+OpenStreetMap (gratis)
 *  - Geocoding: convertir calle+número en lat/lng
 *  - Cálculo de costo de envío según distancia/zona
 *  - Validación de cobertura
 *
 * Endpoints actuales:
 *   GET    /api/addresses        - lista mis direcciones
 *   POST   /api/addresses        - crear nueva
 *   PATCH  /api/addresses/:id    - editar (también podés marcar como principal)
 *   DELETE /api/addresses/:id    - eliminar
 * ============================================================ */

const addressSchema = z.object({
  alias: z.string().optional(),
  calle: z.string().min(2),
  numero: z.string().min(1),
  piso: z.string().optional(),
  depto: z.string().optional(),
  ciudad: z.string().min(2),
  provincia: z.string().min(2),
  codigoPostal: z.string().min(3),
  referencias: z.string().optional(),
  latitud: z.number().optional(),
  longitud: z.number().optional(),
  esPrincipal: z.boolean().optional(),
});

export async function listMyAddresses(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ esPrincipal: "desc" }, { createdAt: "desc" }],
    });
    res.json(addresses);
  } catch (e) { next(e); }
}

export async function createAddress(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const data = addressSchema.parse(req.body);

    // TODO: acá podés llamar a la API de geocoding para obtener lat/lng
    // si el cliente no las envió. Ejemplo con Google Maps:
    //   const geo = await geocode(`${data.calle} ${data.numero}, ${data.ciudad}`);
    //   data.latitud = geo.lat; data.longitud = geo.lng;

    if (data.esPrincipal) {
      await prisma.address.updateMany({
        where: { userId, esPrincipal: true },
        data: { esPrincipal: false },
      });
    }

    const created = await prisma.address.create({
      data: { ...data, userId },
    });
    res.status(201).json(created);
  } catch (e) { next(e); }
}

export async function updateAddress(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const id = Number(req.params.id);
    const data = addressSchema.partial().parse(req.body);

    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId)
      throw new HttpError(404, "Dirección no encontrada");

    if (data.esPrincipal) {
      await prisma.address.updateMany({
        where: { userId, esPrincipal: true, NOT: { id } },
        data: { esPrincipal: false },
      });
    }

    const updated = await prisma.address.update({ where: { id }, data });
    res.json(updated);
  } catch (e) { next(e); }
}

export async function deleteAddress(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const id = Number(req.params.id);
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId)
      throw new HttpError(404, "Dirección no encontrada");

    await prisma.address.delete({ where: { id } });
    res.status(204).end();
  } catch (e) { next(e); }
}
