import { Router } from "express";
import {
  checkout,
  listMyOrders,
  listAllOrders,
  updateOrderStatus,
} from "../controllers/order.controller";
import { authRequired, requireRole } from "../middlewares/auth";

const router = Router();

router.use(authRequired);

router.post("/checkout", checkout);
router.get("/me", listMyOrders);

// Admin / Repositor pueden ver y cambiar estado
router.get("/", requireRole("ADMIN", "RESTOCKER"), listAllOrders);
router.patch("/:id/estado", requireRole("ADMIN", "RESTOCKER"), updateOrderStatus);

export default router;
