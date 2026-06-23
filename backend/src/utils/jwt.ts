import jwt, { SignOptions } from "jsonwebtoken";
import { JwtPayload } from "../types";

const SECRET = process.env.JWT_SECRET || "dev-secret";
const EXPIRES = (process.env.JWT_EXPIRES_IN || "2d") as SignOptions["expiresIn"];

export function signToken(payload: Omit<JwtPayload, "iat" | "exp">) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}
