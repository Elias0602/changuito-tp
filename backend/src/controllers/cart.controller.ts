import { Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../types";
import { cartAddSchema, cartUpdateSchema } from "../utils/validators";
import { HttpError } from "../middlewares/errorHandler";
import { calcularDescuento, aplicarOferta } from "../services/discount.service";

async function getOrCreateActiveCart(userId: number) {
  let cart = await prisma.cart.findFirst({
    where: { userId, estado: "ACTIVO" },
    include: {
      items: {
        include: {
          product: {
            include: {
              ofertas: {
                where: { activa: true, fechaFin: { gt: new Date() } },
                orderBy: { porcentaje: "desc" },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId, estado: "ACTIVO" },
      include: {
        items: { include: { product: { include: { ofertas: true } } } },
      },
    });
  }
  return cart;
}

export async function getMyCart(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const cart = await getOrCreateActiveCart(userId);

    const descuento = await calcularDescuento(userId);
    const subtotal = cart.items.reduce(
      (acc: number, it: any) => acc + it.precioSnapshot * it.cantidad,
      0
    );
    const montoDescuento = +(subtotal * (descuento.porcentaje / 100)).toFixed(2);
    const envioBase = subtotal > 0 ? 1500 : 0;
    const envio = +(envioBase * (1 - descuento.descuentoEnvio / 100)).toFixed(2);
    const total = +(subtotal - montoDescuento + envio).toFixed(2);

    res.json({
      ...cart,
      resumen: {
        subtotal: +subtotal.toFixed(2),
        descuentoPorcentaje: descuento.porcentaje,
        descuentoMonto: montoDescuento,
        motivosDescuento: descuento.motivos,
        envio,
        envioBase,
        descuentoEnvio: descuento.descuentoEnvio,
        envioGratis: descuento.envioGratis,
        total,
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function addToCart(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const data = cartAddSchema.parse(req.body);

    const producto = await prisma.product.findUnique({
      where: { id: data.productId },
      include: {
        ofertas: {
          where: { activa: true, fechaFin: { gt: new Date() } },
          orderBy: { porcentaje: "desc" },
          take: 1,
        },
      },
    });
    if (!producto) throw new HttpError(404, "Producto no encontrado");
    if (producto.stock < data.cantidad)
      throw new HttpError(409, `Stock insuficiente (disponible: ${producto.stock})`);

    const cart = await getOrCreateActiveCart(userId);
    const precio = aplicarOferta(producto.precio, producto.ofertas[0]?.porcentaje);

    const existing = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId: producto.id } },
    });

    if (existing) {
      const nuevaCantidad = existing.cantidad + data.cantidad;
      if (producto.stock < nuevaCantidad)
        throw new HttpError(409, `Stock insuficiente (disponible: ${producto.stock})`);
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { cantidad: nuevaCantidad, precioSnapshot: precio },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: producto.id,
          cantidad: data.cantidad,
          precioSnapshot: precio,
        },
      });
    }

    res.status(201).json({ ok: true });
  } catch (e) {
    next(e);
  }
}

export async function updateCartItem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const itemId = Number(req.params.itemId);
    const data = cartUpdateSchema.parse(req.body);

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true, product: true },
    });
    if (!item) throw new HttpError(404, "Item no encontrado");
    if (item.cart.userId !== userId) throw new HttpError(403, "No autorizado");

    if (data.cantidad === 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
      return res.json({ ok: true, removed: true });
    }

    if (item.product.stock < data.cantidad)
      throw new HttpError(409, `Stock insuficiente (disponible: ${item.product.stock})`);

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { cantidad: data.cantidad },
    });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

export async function removeCartItem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const itemId = Number(req.params.itemId);
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });
    if (!item) throw new HttpError(404, "Item no encontrado");
    if (item.cart.userId !== userId) throw new HttpError(403, "No autorizado");
    await prisma.cartItem.delete({ where: { id: itemId } });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

export async function clearCart(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const cart = await prisma.cart.findFirst({
      where: { userId, estado: "ACTIVO" },
    });
    if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}
