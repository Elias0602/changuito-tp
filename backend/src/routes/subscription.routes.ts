import { Router } from "express";
import {
  planes,
  suscribirse,
  miSuscripcion,
  cancelarSuscripcion,
} from "../controllers/subscription.controller";
import { authRequired } from "../middlewares/auth";

const router = Router();

router.get("/planes", planes);

router.use(authRequired);
router.get("/mia", miSuscripcion);
router.post("/", suscribirse);
router.delete("/", cancelarSuscripcion);

export default router;
