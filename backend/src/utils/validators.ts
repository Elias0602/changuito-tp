import { z } from "zod";

export const registerSchema = z.object({
  nombre: z.string().min(2, "El nombre es muy corto").max(80),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  esJubilado: z.boolean().optional(),
  esEstudiante: z.boolean().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const twoFactorVerifySchema = z.object({
  userId: z.number().int().positive(),
  token: z.string().min(6).max(6),
});

export const productCreateSchema = z.object({
  nombre: z.string().min(2).max(120),
  descripcion: z.string().optional(),
  precio: z.number().nonnegative(),
  stock: z.number().int().nonnegative().default(0),
  categoryId: z.number().int().positive(),
  imagenUrl: z.string().url().optional().nullable(),
});

export const productUpdateSchema = productCreateSchema.partial();

export const categoryCreateSchema = z.object({
  nombre: z.string().min(2).max(60),
  slug: z.string().min(2).max(60).regex(/^[a-z0-9-]+$/, "slug en minúsculas y guiones"),
  icono: z.string().optional(),
});

export const cartAddSchema = z.object({
  productId: z.number().int().positive(),
  cantidad: z.number().int().positive().default(1),
});

export const cartUpdateSchema = z.object({
  cantidad: z.number().int().nonnegative(),
});

export const offerCreateSchema = z.object({
  productId: z.number().int().positive(),
  porcentaje: z.number().min(1).max(95),
  fechaFin: z.string().datetime().or(z.date()),
  esImperdible: z.boolean().optional(),
});

export const checkoutSchema = z.object({
  metodoPago: z.enum(["QR", "DEBITO", "CREDITO"]),
});

export const subscribeSchema = z.object({
  plan: z.enum(["BASICO", "ESTANDAR", "PLUS"]),
  periodo: z.enum(["MENSUAL", "ANUAL"]),
});

export const updateOrderStatusSchema = z.object({
  estado: z.enum(["PENDIENTE", "LISTO", "ENTREGADO", "CANCELADO"]),
});
