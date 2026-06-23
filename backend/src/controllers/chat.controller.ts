import { Request, Response } from "express";
import { getChatbotResponse } from "../services/chat.service";

export async function handleChatMessage(req: Request, res: Response) {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "El mensaje es requerido" });
    }

    const reply = await getChatbotResponse(message, history);
    return res.json({ reply });
  } catch (error) {
    console.error("Error en chatbot:", error);
    return res.status(500).json({ error: "Error al procesar el mensaje" });
  }
}