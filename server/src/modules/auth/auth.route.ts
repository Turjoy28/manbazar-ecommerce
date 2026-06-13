import { Router } from "express";
import { authController } from "./auth.controller.js";
import { authenticate } from "../../middleware/authenticate.js";

const router = Router();

/** Public: Admin login */
router.post("/login", authController.login);

/** Public: Admin logout */
router.post("/logout", authController.logout);

/** Protected: Get current admin info */
router.get("/me", authenticate, authController.me);

export const authRoute = router;
