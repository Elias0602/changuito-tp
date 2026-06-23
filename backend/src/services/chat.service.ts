import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getChatbotResponse(
  userMessage: string,
  history: { role: string; content?: string; text?: string }[] = []
) {
  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    history: history.map((h) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.content ?? h.text ?? "" }],
    })),
    config: {
      systemInstruction:
        "Sos el asistente virtual de El Changuito, un autoservicio online. Respondé de forma clara, breve y amable, en español rioplatense. Si no sabés algo, decilo honestamente.",
    },
  });

  const response = await chat.sendMessage({ message: userMessage });
  return response.text;
}