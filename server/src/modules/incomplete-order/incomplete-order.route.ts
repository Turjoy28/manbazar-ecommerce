import { Router } from "express";
import { incompleteOrderController } from "./incomplete-order.controller.js";
import { authenticate } from "../../middleware/authenticate.js";

const router = Router();

// ── Public ─────────────────────────────────────────────────────────────────────
/** POST — Upsert an incomplete order (called by client form onChange) */
router.post("/", incompleteOrderController.upsertIncompleteOrder);

// ── Admin protected ────────────────────────────────────────────────────────────
/** GET — All incomplete orders with pagination */
router.get("/", authenticate, incompleteOrderController.getIncompleteOrders);

/** DELETE — Bulk delete incomplete orders */
router.delete("/", authenticate, incompleteOrderController.deleteIncompleteOrders);

/** DELETE — Delete a single incomplete order */
router.delete("/:id", authenticate, incompleteOrderController.deleteIncompleteOrder);

export const incompleteOrderRoute = router;
