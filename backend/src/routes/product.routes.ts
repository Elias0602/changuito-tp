import { Router } from "express";
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  reponerStock,
  recomendaciones,
} from "../controllers/product.controller";
import { authRequired, requireRole } from "../middlewares/auth";

const router = Router();

// Públicas
router.get("/", listProducts);
router.get("/recomendaciones", recomendaciones);
router.get("/:id", getProduct);

// Admin
router.post("/", authRequired, requireRole("ADMIN"), createProduct);
router.patch("/:id", authRequired, requireRole("ADMIN"), updateProduct);
router.delete("/:id", authRequired, requireRole("ADMIN"), deleteProduct);

// Repositor o Admin
router.post(
  "/:id/reponer",
  authRequired,
  requireRole("ADMIN", "RESTOCKER"),
  reponerStock
);

export default router;
