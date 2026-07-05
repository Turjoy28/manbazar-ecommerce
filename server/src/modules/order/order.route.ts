import { Router } from "express";
import { orderController } from "./order.controller.js";
import { authenticate } from "../../middleware/authenticate.js";

const router = Router();

// ── Public ─────────────────────────────────────────────────────────────────────
/** POST — Place a new order */
router.post("/", orderController.createOrder);

// ── Admin protected ────────────────────────────────────────────────────────────
/** GET — All orders with pagination */
router.get("/", authenticate, orderController.getOrders);

/** GET — Dashboard statistics */
router.get("/stats", authenticate, orderController.getStats);

/** GET — Monthly chart data */
router.get("/monthly", authenticate, orderController.getMonthlyData);

/** PATCH — Update a single order status */
router.patch("/:id/status", authenticate, orderController.updateOrderStatus);

/** PATCH — Reconcile a COD order payment → mark as 'completed' */
router.patch("/:id/reconcile", authenticate, orderController.reconcilePayment);

/** DELETE — Bulk delete orders */
router.delete("/", authenticate, orderController.deleteOrders);

export const orderRoute = router;
