import { Router } from "express";
import {
  listOffers,
  createOffer,
  deactivateOffer,
  deleteOffer,
} from "../controllers/offer.controller";
import { authRequired, requireRole } from "../middlewares/auth";

const router = Router();

router.get("/", listOffers);

router.post("/", authRequired, requireRole("ADMIN"), createOffer);
router.patch("/:id/desactivar", authRequired, requireRole("ADMIN"), deactivateOffer);
router.delete("/:id", authRequired, requireRole("ADMIN"), deleteOffer);

export default router;
