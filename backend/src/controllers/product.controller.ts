import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { productCreateSchema, productUpdateSchema } from "../utils/validators";
import { HttpError } from "../middlewares/errorHandler";
import { aplicarOferta } from "../services/discount.service";

/** GET /productos?search=&categoryId=&onlyOffers=true */
export async function listProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, categoryId, onlyOffers } = req.query;

    const where: any = {};
    if (search) where.nombre = { contains: String(search) };
    if (categoryId) where.categoryId = Number(categoryId);

    const productos = await prisma.product.findMany({
      where,
      include: {
        category: true,
        ofertas: {
          where: { activa: true, fechaFin: { gt: new Date() } },
          orderBy: { porcentaje: "desc" },
          take: 1,
        },
      },
      orderBy: { id: "desc" },
    });

    let resultado = productos.map((p) => {
      const oferta = p.ofertas[0];
      return {
        id: p.id,
        nombre: p.nombre,
        descripcion: p.descripcion,
        precio: p.precio,
        precioFinal: aplicarOferta(p.precio, oferta?.porcentaje),
        stock: p.stock,
        imagenUrl: p.imagenUrl,
        category: p.category,
        oferta: oferta
          ? { porcentaje: oferta.porcentaje, esImperdible: oferta.esImperdible }
          : null,
      };
    });

    if (onlyOffers === "true") {
      resultado = resultado.filter((p) => p.oferta);
    }

    res.json(resultado);
  } catch (e) {
    next(e);
  }
}

export async function getProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const p = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        ofertas: {
          where: { activa: true, fechaFin: { gt: new Date() } },
          orderBy: { porcentaje: "desc" },
          take: 1,
        },
      },
    });
    if (!p) throw new HttpError(404, "Producto no encontrado");

    const oferta = p.ofertas[0];
    res.json({
      ...p,
      precioFinal: aplicarOferta(p.precio, oferta?.porcentaje),
      oferta: oferta
        ? { porcentaje: oferta.porcentaje, esImperdible: oferta.esImperdible }
        : null,
    });
  } catch (e) {
    next(e);
  }
}

/** Recomendaciones: ofertas imperdibles + más nuevos */
export async function recomendaciones(_req: Request, res: Response, next: NextFunction) {
  try {
    const imperdibles = await prisma.product.findMany({
      where: {
        ofertas: { some: { activa: true, esImperdible: true, fechaFin: { gt: new Date() } } },
      },
      include: {
        category: true,
        ofertas: { where: { activa: true }, orderBy: { porcentaje: "desc" }, take: 1 },
      },
      take: 8,
    });

    const nuevos = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        category: true,
        ofertas: { where: { activa: true, fechaFin: { gt: new Date() } }, take: 1 },
      },
    });

    const map = (arr: typeof imperdibles) =>
      arr.map((p) => {
        const oferta = p.ofertas[0];
        return {
          id: p.id,
          nombre: p.nombre,
          precio: p.precio,
          precioFinal: aplicarOferta(p.precio, oferta?.porcentaje),
          imagenUrl: p.imagenUrl,
          category: p.category,
          oferta: oferta
            ? { porcentaje: oferta.porcentaje, esImperdible: oferta.esImperdible }
            : null,
        };
      });

    res.json({ imperdibles: map(imperdibles), nuevos: map(nuevos) });
  } catch (e) {
    next(e);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const data = productCreateSchema.parse(req.body);
    const p = await prisma.product.create({ data });
    res.status(201).json(p);
  } catch (e) {
    next(e);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const data = productUpdateSchema.parse(req.body);
    const p = await prisma.product.update({ where: { id }, data });
    res.json(p);
  } catch (e) {
    next(e);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await prisma.product.delete({ where: { id } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
}

/** Reposición de stock (Repositor o Admin con permiso) */
export async function reponerStock(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { cantidad } = req.body as { cantidad: number };
    if (!cantidad || cantidad <= 0)
      throw new HttpError(400, "Cantidad inválida");

    const p = await prisma.product.update({
      where: { id },
      data: { stock: { increment: cantidad } },
    });
    res.json(p);
  } catch (e) {
    next(e);
  }
}
