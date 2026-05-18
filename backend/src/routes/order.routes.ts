import { Router } from "express";
import {
  checkout,
  checkoutMercadoPago,
  verificarPagoMP,
  webhookMP,
  listMyOrders,
  listAllOrders,
  updateOrderStatus,
} from "../controllers/order.controller";
import { authRequired, requireRole } from "../middlewares/auth";

const router = Router();

// El webhook NO lleva auth (MP no tiene el JWT del user)
router.post("/webhook/mp", webhookMP);

router.use(authRequired);

router.post("/checkout", checkout);
router.post("/checkout-mp", checkoutMercadoPago);
router.get("/:id/verificar-pago", verificarPagoMP);
router.get("/me", listMyOrders);

router.get("/", requireRole("ADMIN", "RESTOCKER"), listAllOrders);
router.patch("/:id/estado", requireRole("ADMIN", "RESTOCKER"), updateOrderStatus);

export default router;
