import { Router } from "express";
import { chat } from "../controllers/chat.controller";

const router = Router();

// Sin auth - cualquiera puede hablar con el asistente
router.post("/", chat);

export default router;
