import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { categoryCreateSchema } from "../utils/validators";

export async function listCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const cats = await prisma.category.findMany({
      orderBy: { nombre: "asc" },
      include: { _count: { select: { productos: true } } },
    });
    res.json(cats);
  } catch (e) {
    next(e);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const data = categoryCreateSchema.parse(req.body);
    const c = await prisma.category.create({ data });
    res.status(201).json(c);
  } catch (e) {
    next(e);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await prisma.category.delete({ where: { id } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
}
