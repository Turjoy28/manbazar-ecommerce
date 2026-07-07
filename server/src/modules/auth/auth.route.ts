import { Router } from "express";
import { authController } from "./auth.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();

/** Public: Admin login */
router.post("/login", authController.login);

/** Public: Admin logout */
router.post("/logout", authController.logout);

/** Protected: Get current admin info */
router.get("/me", authenticate, authController.me);

/** Protected: Create and list Sub-Admin Managers (Super Admin Only) */
router.post("/managers", authenticate, authorize("ADMIN"), authController.createManager);
router.get("/managers", authenticate, authorize("ADMIN"), authController.listManagers);

/** Public: Onboarding Verification & password configuration */
router.get("/verify-onboarding", authController.verifyOnboarding);
router.post("/set-password", authController.setPassword);

export const authRoute = router;
