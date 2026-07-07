import { Router } from "express";
import { bannersController } from "./banners.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();

// Public route to fetch banners for client storefront
router.get("/", bannersController.getAllBanners);

// Protected routes for banner management (ADMIN, MANAGER, and USER roles have access)
router.post("/", authenticate, authorize("ADMIN", "MANAGER", "USER"), bannersController.createBanner);
router.patch("/:id", authenticate, authorize("ADMIN", "MANAGER", "USER"), bannersController.updateBanner);
router.delete("/:id", authenticate, authorize("ADMIN", "MANAGER", "USER"), bannersController.deleteBanner);

export const bannersRoute = router;
