import { Router } from "express";
import {
  listMyAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/address.controller";
import { authRequired } from "../middlewares/auth";

const router = Router();

router.use(authRequired);

router.get("/", listMyAddresses);
router.post("/", createAddress);
router.patch("/:id", updateAddress);
router.delete("/:id", deleteAddress);

export default router;
