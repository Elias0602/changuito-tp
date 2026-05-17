import { Router } from "express";
import {
  register,
  login,
  setup2FA,
  confirm2FA,
  verify2FALogin,
  me,
} from "../controllers/auth.controller";
import { authRequired } from "../middlewares/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/2fa/verify-login", verify2FALogin);

router.get("/me", authRequired, me);
router.post("/2fa/setup", authRequired, setup2FA);
router.post("/2fa/confirm", authRequired, confirm2FA);

export default router;
