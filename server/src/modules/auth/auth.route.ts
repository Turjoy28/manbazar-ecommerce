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

/** Public: Forgot Password & Email hints */
router.get("/admin-emails-hint", authController.getAdminEmailsHint);
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-reset-otp", authController.verifyResetOtp);
router.post("/reset-password", authController.resetPassword);

/** Protected: Update Admin email addresses (Super Admin Only) */
router.patch("/admin-emails", authenticate, authorize("ADMIN"), authController.updateAdminEmails);

export const authRoute = router;
