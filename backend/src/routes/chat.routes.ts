import { Router } from "express";
import { handleChatMessage } from "../controllers/chat.controller";

const router = Router();

router.post("/", handleChatMessage);

export default router;