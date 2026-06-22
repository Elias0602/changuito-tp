import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getChatbotResponse(
  userMessage: string,
  history: { role: "user" | "model"; text: string }[] = []
) {
  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    history: history.map((h) => ({
      role: h.role,
      parts: [{ text: h.text }],
    })),
    config: {
      systemInstruction:
        "Sos el asistente virtual de [Nombre de tu autoservicio]. Respondé de forma clara, breve y amable. Si no sabés algo, decilo honestamente.",
    },
  });

  const response = await chat.sendMessage({ message: userMessage });
  return response.text;
}