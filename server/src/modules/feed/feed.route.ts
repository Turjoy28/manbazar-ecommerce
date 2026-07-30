import { Router } from "express";
import { feedController } from "./feed.controller.js";

const router = Router();

// ── Public XML Feed Endpoints (no authentication) ──────────────────────────────

/** GET /feed/products.xml — ManBazar product catalog */
router.get("/products.xml", feedController.getProductsCatalogXml);

/** GET /feed/google-shopping.xml — Google Merchant Center feed */
router.get("/google-shopping.xml", feedController.getGoogleShoppingXml);

/** GET /feed/facebook-catalog.xml — Facebook / Instagram product feed */
router.get("/facebook-catalog.xml", feedController.getFacebookCatalogXml);

export const feedRoute = router;
