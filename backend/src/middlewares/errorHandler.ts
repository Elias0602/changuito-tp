import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Datos inválidos",
      issues: err.issues.map((i) => ({ campo: i.path.join("."), mensaje: i.message })),
    });
  }
  if (err instanceof Error) {
    const status = (err as any).status || 500;
    return res.status(status).json({ error: err.message });
  }
  res.status(500).json({ error: "Error interno" });
}

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
