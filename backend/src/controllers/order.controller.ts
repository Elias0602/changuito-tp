import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../types";
import { checkoutSchema, updateOrderStatusSchema } from "../utils/validators";
import { HttpError } from "../middlewares/errorHandler";
import { calcularDescuento } from "../services/discount.service";
import { procesarPago } from "../services/payment.service";
import { crearPreferencia, mpDisponible, obtenerEstadoPago } from "../services/mercadopago.service";

async function calcularTotales(userId: number, cart: any) {
  const descuento = await calcularDescuento(userId);
  const subtotal = cart.items.reduce(
    (acc: number, it: any) => acc + it.precioSnapshot * it.cantidad,
    0
  );
  const montoDescuento = +(subtotal * (descuento.porcentaje / 100)).toFixed(2);
  const envioBase = 1500;
  const envio = +(envioBase * (1 - descuento.descuentoEnvio / 100)).toFixed(2);
  const total = +(subtotal - montoDescuento + envio).toFixed(2);
  return { subtotal, montoDescuento, envio, total, descuento };
}

async function validarCart(userId: number) {
  const cart = await prisma.cart.findFirst({
    where: { userId, estado: "ACTIVO" },
    include: { items: { include: { product: true } } },
  });
  if (!cart || cart.items.length === 0)
    throw new HttpError(400, "El carrito está vacío");

  for (const it of cart.items) {
    if (it.product.stock < it.cantidad) {
      throw new HttpError(
        409,
        `Sin stock suficiente para "${it.product.nombre}" (disponible: ${it.product.stock})`
      );
    }
  }
  return cart;
}

/**
 * POST /orders/checkout - sistema simulado (QR / DEBITO / CREDITO)
 */
export async function checkout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { metodoPago } = checkoutSchema.parse(req.body);

    const cart = await validarCart(userId);
    const { subtotal, montoDescuento, envio, total } = await calcularTotales(userId, cart);

    const pago = await procesarPago(metodoPago, total, `cart-${cart.id}`);
    if (!pago.ok) throw new HttpError(402, "Pago rechazado, intentá con otro medio");

    const order = await prisma.$transaction(async (tx: any) => {
      for (const it of cart.items) {
        await tx.product.update({
          where: { id: it.productId },
          data: { stock: { decrement: it.cantidad } },
        });
      }
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
      await tx.cart.update({ where: { id: cart.id }, data: { estado: "PAGADO" } });
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

/**
 * POST /orders/checkout-mp - pago real con Mercado Pago
 * Crea la Order como PENDIENTE_PAGO, una preferencia en MP, y devuelve la URL
 * para que el frontend redirija al usuario.
 */
export async function checkoutMercadoPago(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!mpDisponible()) {
      throw new HttpError(503, "Mercado Pago no está configurado en el servidor");
    }

    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpError(404, "Usuario no encontrado");

    const cart = await validarCart(userId);
    const { subtotal, montoDescuento, envio, total } = await calcularTotales(userId, cart);

    // Si ya existe una orden pendiente para este carrito, la borramos y
    // creamos una nueva (puede pasar si el usuario abandonó MP a mitad).
    const ordenVieja = await prisma.order.findUnique({
      where: { cartId: cart.id },
    });
    if (ordenVieja && ordenVieja.estado === "PENDIENTE") {
      await prisma.orderItem.deleteMany({ where: { orderId: ordenVieja.id } });
      await prisma.order.delete({ where: { id: ordenVieja.id } });
    }

    // Crear orden como PENDIENTE de pago (sin descontar stock todavía)
    const order = await prisma.order.create({
      data: {
        cartId: cart.id,
        userId,
        subtotal: +subtotal.toFixed(2),
        descuento: montoDescuento,
        envio,
        montoFinal: total,
        metodoPago: "MERCADOPAGO",
        estado: "PENDIENTE",
        items: {
          create: cart.items.map((it: any) => ({
            productId: it.productId,
            cantidad: it.cantidad,
            precioSnapshot: it.precioSnapshot,
          })),
        },
      },
    });

    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").split(",")[0].trim();
    const backendUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;

    const pref = await crearPreferencia({
      orderId: order.id,
      monto: total,
      descripcion: `Compra Changuito #${order.id}`,
      email: user.email,
      frontendUrl,
      backendUrl,
    });

    res.status(201).json({
      orderId: order.id,
      initPoint: pref.initPoint,
      sandboxInitPoint: pref.sandboxInitPoint,
    });
  } catch (e) {
    next(e);
  }
}

/**
 * GET /orders/:id/verificar-pago - confirma con MP el estado del pago
 * y, si está aprobado, descuenta stock y marca el carrito como PAGADO.
 */
export async function verificarPagoMP(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const orderId = Number(req.params.id);
    const paymentId = req.query.payment_id as string | undefined;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, cart: true },
    });
    if (!order || order.userId !== userId) throw new HttpError(404, "Pedido no encontrado");

    if (order.estado !== "PENDIENTE") {
      return res.json({ orderId: order.id, estado: order.estado, ya: true });
    }

    if (!paymentId || !mpDisponible()) {
      return res.json({ orderId: order.id, estado: order.estado, ya: false });
    }

    const info = await obtenerEstadoPago(paymentId);
    if (info.status === "approved") {
      await prisma.$transaction(async (tx: any) => {
        for (const it of order.items) {
          await tx.product.update({
            where: { id: it.productId },
            data: { stock: { decrement: it.cantidad } },
          });
        }
        await tx.order.update({
          where: { id: order.id },
          data: { estado: "PENDIENTE", fechaPago: new Date() },
        });
        await tx.cart.update({ where: { id: order.cartId }, data: { estado: "PAGADO" } });
      });
      return res.json({ orderId: order.id, estado: "PENDIENTE", aprobado: true });
    }

    if (info.status === "rejected") {
      await prisma.order.update({
        where: { id: order.id },
        data: { estado: "CANCELADO" },
      });
      return res.json({ orderId: order.id, estado: "CANCELADO", aprobado: false });
    }

    res.json({ orderId: order.id, estado: order.estado, aprobado: false });
  } catch (e) {
    next(e);
  }
}

/**
 * POST /orders/webhook/mp - notificación asíncrona de Mercado Pago
 */
export async function webhookMP(req: Request, res: Response) {
  try {
    const { type, data } = req.body || {};
    if (type === "payment" && data?.id) {
      const info = await obtenerEstadoPago(String(data.id));
      const orderId = Number(info.externalReference);
      if (orderId && info.status === "approved") {
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { items: true },
        });
        if (order && order.estado === "PENDIENTE") {
          await prisma.$transaction(async (tx: any) => {
            for (const it of order.items) {
              await tx.product.update({
                where: { id: it.productId },
                data: { stock: { decrement: it.cantidad } },
              });
            }
            await tx.cart.update({ where: { id: order.cartId }, data: { estado: "PAGADO" } });
          });
        }
      }
    }
    res.status(200).send("ok");
  } catch (e) {
    console.error("webhook MP error:", e);
    res.status(200).send("ok");
  }
}

export async function listMyOrders(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: { include: { category: true } } } } },
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
