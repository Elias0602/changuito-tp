import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { responder } from "../services/chat.service";

const chatSchema = z.object({
  message: z.string().min(1).max(500),
  history: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })).optional(),
});

export async function chat(req: Request, res: Response, next: NextFunction) {
  try {
    const data = chatSchema.parse(req.body);
    const result = await responder(data);
    res.json(result);
  } catch (e) { next(e); }
}
