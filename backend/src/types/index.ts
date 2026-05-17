import { Request } from "express";

export type Role = "CUSTOMER" | "ADMIN" | "RESTOCKER";

export interface JwtPayload {
  userId: number;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}
