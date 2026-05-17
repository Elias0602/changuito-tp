import { Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../types";
import { checkoutSchema, updateOrderStatusSchema } from "../utils/validators";
import { HttpError } from "../middlewares/errorHandler";
import { calcularDescuento } from "../services/discount.service";
import { procesarPago } from "../services/payment.service";

/**
 * POST /orders/checkout
 * 1. Toma el carrito activo, valida stock real
 * 2. Calcula descuentos y envío
 * 3. Procesa pago (simulado)
 * 4. En una sola transacción: descuenta stock, crea Order + OrderItems,
 *    marca carrito como PAGADO.
 */
export async function checkout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { metodoPago } = checkoutSchema.parse(req.body);

    const cart = await prisma.cart.findFirst({
      where: { userId, estado: "ACTIVO" },
      include: { items: { include: { product: true } } },
    });
    if (!cart || cart.items.length === 0)
      throw new HttpError(400, "El carrito está vacío");

    // Validación de stock en tiempo real
    for (const it of cart.items) {
      if (it.product.stock < it.cantidad) {
        throw new HttpError(
          409,
          `Sin stock suficiente para "${it.product.nombre}" (disponible: ${it.product.stock})`
        );
      }
    }

    const descuento = await calcularDescuento(userId);
    const subtotal = cart.items.reduce(
      (acc: number, it: any) => acc + it.precioSnapshot * it.cantidad,
      0
    );
    const montoDescuento = +(subtotal * (descuento.porcentaje / 100)).toFixed(2);
    const envio = descuento.envioGratis ? 0 : 1500;
    const total = +(subtotal - montoDescuento + envio).toFixed(2);

    // Pago simulado
    const pago = await procesarPago(metodoPago, total, `cart-${cart.id}`);
    if (!pago.ok) throw new HttpError(402, "Pago rechazado, intentá con otro medio");

    const order = await prisma.$transaction(async (tx: any) => {
      // Descontar stock
      for (const it of cart.items) {
        await tx.product.update({
          where: { id: it.productId },
          data: { stock: { decrement: it.cantidad } },
        });
      }

      // Crear orden
      const o = await tx.order.create({
        data: {
          cartId: cart.id,
          userId,
          subtotal: +subtotal.toFixed(2),
          descuento: montoDescuento,
          envio,
          montoFinal: total,
          metodoPago,
          estado: "PENDIENTE",
          items: {
            create: cart.items.map((it: any) => ({
              productId: it.productId,
              cantidad: it.cantidad,
              precioSnapshot: it.precioSnapshot,
            })),
          },
        },
        include: { items: { include: { product: true } } },
      });

      // Marcar carrito como pagado
      await tx.cart.update({
        where: { id: cart.id },
        data: { estado: "PAGADO" },
      });

      return o;
    });

    res.status(201).json({
      order,
      pago: { comprobante: pago.comprobante, qr: pago.qr ?? null },
    });
  } catch (e) {
    next(e);
  }
}

export async function listMyOrders(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { fechaPago: "desc" },
    });
    res.json(orders);
  } catch (e) {
    next(e);
  }
}

export async function listAllOrders(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, nombre: true, email: true } },
      },
      orderBy: { fechaPago: "desc" },
    });
    res.json(orders);
  } catch (e) {
    next(e);
  }
}

export async function updateOrderStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { estado } = updateOrderStatusSchema.parse(req.body);
    const o = await prisma.order.update({ where: { id }, data: { estado } });
    res.json(o);
  } catch (e) {
    next(e);
  }
}
