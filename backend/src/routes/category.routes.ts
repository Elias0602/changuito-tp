import { Router } from "express";
import {
  listCategories,
  createCategory,
  deleteCategory,
} from "../controllers/category.controller";
import { authRequired, requireRole } from "../middlewares/auth";

const router = Router();

router.get("/", listCategories);
router.post("/", authRequired, requireRole("ADMIN"), createCategory);
router.delete("/:id", authRequired, requireRole("ADMIN"), deleteCategory);

export default router;
