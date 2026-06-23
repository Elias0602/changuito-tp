import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { signToken } from "../utils/jwt";
import {
  registerSchema,
  loginSchema,
  twoFactorVerifySchema,
} from "../utils/validators";
import { HttpError } from "../middlewares/errorHandler";
import { generarSecreto2FA, verificarToken2FA } from "../services/twofa.service";
import { AuthRequest, Role } from "../types";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new HttpError(409, "El email ya está registrado");

    const hash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        password: hash,
        esJubilado: data.esJubilado ?? false,
        esEstudiante: data.esEstudiante ?? false,
        role: "CUSTOMER",
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        role: true,
        esJubilado: true,
        esEstudiante: true,
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as Role,
    });

    res.status(201).json({ user, token });
  } catch (e) {
    next(e);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new HttpError(401, "Credenciales inválidas");

    const ok = await bcrypt.compare(data.password, user.password);
    if (!ok) throw new HttpError(401, "Credenciales inválidas");

    // Si tiene 2FA habilitado, NO devolvemos token completo todavía.
    if (user.twoFactorEnabled) {
      return res.json({
        twoFactorRequired: true,
        userId: user.id,
        message: "Ingresá el código de 6 dígitos de tu app autenticadora",
      });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as Role,
    });

    res.json({
      twoFactorRequired: false,
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
        esJubilado: user.esJubilado,
        esEstudiante: user.esEstudiante,
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function setup2FA(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "No autenticado");
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) throw new HttpError(404, "Usuario no encontrado");

    if (user.twoFactorEnabled) {
      throw new HttpError(400, "Ya tenés 2FA activo. Desactivalo primero si querés cambiar el dispositivo.");
    }

    const { base32, qrDataUrl } = await generarSecreto2FA(user.email);

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: base32, twoFactorEnabled: false },
    });

    res.json({
      qrDataUrl,
      secret: base32,
      message: "Escaneá el QR y verificá con un código para activar 2FA",
    });
  } catch (e) {
    next(e);
  }
}

export async function disable2FA(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "No autenticado");
    const { token } = req.body as { token: string };
    if (!token) throw new HttpError(400, "Tenés que ingresar un código para confirmar");

    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
      throw new HttpError(400, "No tenés 2FA activo");
    }

    const ok = verificarToken2FA(user.twoFactorSecret, token);
    if (!ok) throw new HttpError(400, "Código incorrecto");

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: null, twoFactorEnabled: false },
    });

    res.json({ ok: true, message: "2FA desactivado" });
  } catch (e) {
    next(e);
  }
}

export async function confirm2FA(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "No autenticado");
    const { token } = req.body as { token: string };
    if (!token) throw new HttpError(400, "Falta el código");

    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user?.twoFactorSecret) throw new HttpError(400, "Iniciá el setup primero");

    const ok = verificarToken2FA(user.twoFactorSecret, token);
    if (!ok) throw new HttpError(400, "Código inválido");

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: true },
    });

    res.json({ ok: true, message: "2FA activado correctamente" });
  } catch (e) {
    next(e);
  }
}

export async function verify2FALogin(req: Request, res: Response, next: NextFunction) {
  try {
    const data = twoFactorVerifySchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user || !user.twoFactorSecret) throw new HttpError(400, "2FA no configurado");

    const ok = verificarToken2FA(user.twoFactorSecret, data.token);
    if (!ok) throw new HttpError(401, "Código incorrecto");

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as Role,
    });

    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
        esJubilado: user.esJubilado,
        esEstudiante: user.esEstudiante,
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "No autenticado");
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        nombre: true,
        email: true,
        role: true,
        esJubilado: true,
        esEstudiante: true,
        twoFactorEnabled: true,
        subscriptions: {
          where: { activa: true, fechaVencimiento: { gt: new Date() } },
          orderBy: { fechaVencimiento: "desc" },
          take: 1,
        },
      },
    });
    res.json({ user });
  } catch (e) {
    next(e);
  }
}
