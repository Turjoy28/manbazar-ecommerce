import { Router } from "express";
import { productController } from "./product.controller.js";
import { authenticate } from "../../middleware/authenticate.js";

const router = Router();

// ── Public routes ──────────────────────────────────────────────────────────────
/** GET all active products (for client) */
router.get("/", productController.getAllProducts);

/** GET product by slug (for client product detail page) */
router.get("/slug/:slug", productController.getProductBySlug);

// ── Admin-protected routes ─────────────────────────────────────────────────────
/** GET all products including inactive (for admin) */
router.get("/admin/all", authenticate, productController.getAllProductsAdmin);

/** GET product by ID (for admin edit) */
router.get("/:id", authenticate, productController.getProductById);

/** POST create product */
router.post("/", authenticate, productController.createProduct);

/** PATCH update product */
router.patch("/:id", authenticate, productController.updateProduct);

/** DELETE product */
router.delete("/:id", authenticate, productController.deleteProduct);

export const productRoute = router;