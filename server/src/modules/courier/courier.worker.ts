import { Order } from "../../models/order.model.js";
import { courierManager } from "./courier.manager.js";
import { normalizeCourierStatus } from "./courier.mapper.js";
import { socketService } from "../socket/socket.service.js";

/**
 * Redis-free courier status sync.
 * Polls CarryBee / Steadfast / Pathao APIs on a timer to pull the latest
 * transfer_status for every active (non-terminal) shipment and updates
 * the order + tracking history in MongoDB.
 *
 * Runs every 5 minutes by default.
 */
const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

const syncCourierStatus = async () => {
    try {
        // Find orders that have a courier assigned but aren't in a terminal state
        const orders = await Order.find({
            status: { $nin: ["delivered", "cancelled", "returned"] },
            "courier.provider": { $exists: true, $ne: null },
            "courier.consignmentId": { $exists: true, $ne: "" },
        });

        if (!orders.length) return;

        console.log(`[CourierSync] Syncing ${orders.length} active shipment(s)...`);

        for (const order of orders) {
            if (!order.courier?.provider || !order.courier?.consignmentId) continue;

            try {
                // For Steadfast: prefer trackingCode, but also pass order._id as invoice fallback.
                // The updated SteadfastService.getTrackingStatus tries: trackingCode → cid → invoice.
                const trackingId = order.courier.trackingCode || order.courier.consignmentId;
                const trackingResponse = await courierManager.getTrackingStatus(
                    order.courier.provider,
                    trackingId
                );

                const payloadWithId = {
                    ...trackingResponse,
                    consignment_id: trackingResponse?.consignment_id || order.courier.consignmentId,
                    tracking_code: trackingResponse?.tracking_code || order.courier.trackingCode,
                    // Invoice = order._id — used by Steadfast as a reliable identifier
                    invoice: trackingResponse?.invoice || order._id.toString(),
                };

                const normalized = normalizeCourierStatus(order.courier.provider, payloadWithId);

                // Skip if status hasn't changed AND no new rider info
                const statusUnchanged = normalized.status === order.status && normalized.rawStatus === order.courier.rawStatus;
                const riderUnchanged = !normalized.rider?.name || order.courier.rider?.name === normalized.rider.name;
                if (statusUnchanged && riderUnchanged) {
                    continue;
                }

                console.log(
                    `[CourierSync] Order ${order._id}: ${order.status} → ${normalized.status} (raw: ${normalized.rawStatus})`
                );

                // Check for duplicate tracking entry
                const alreadyExists = order.trackingHistory?.some(
                    (item: any) => item.eventId === normalized.eventId
                );

                if (!alreadyExists) {
                    // Update order status
                    order.status = normalized.status as any;
                    order.courier!.rawStatus = normalized.rawStatus;
                    order.courier!.lastSyncedAt = new Date();

                    // Save or update rider assignment if found in polling response
                    if (normalized.rider?.name || normalized.rider?.phone) {
                        order.courier!.rider = {
                            name: normalized.rider.name || order.courier!.rider?.name || "",
                            phone: normalized.rider.phone || order.courier!.rider?.phone || "",
                            type: normalized.rider.type || (normalized.status === "courier_assigned" ? "pickup" : "delivery"),
                            assignedAt: new Date(),
                        };
                    }

                    // If delivered and Cash on Delivery, mark payment as completed
                    if (normalized.status === "delivered" && order.paymentMethod === "cod") {
                        order.paymentStatus = "completed";
                    }

                    // Also update legacy fields for backward compat
                    (order as any).courierStatus = normalized.rawStatus;

                    // Push to tracking history
                    order.trackingHistory.push({
                        status: normalized.status,
                        rawStatus: normalized.rawStatus,
                        message: normalized.message,
                        location: (normalized as any).location || "",
                        provider: order.courier.provider,
                        eventId: normalized.eventId,
                        timestamp: normalized.timestamp,
                        rider: normalized.rider
                            ? {
                                name: normalized.rider.name,
                                phone: normalized.rider.phone,
                                type: normalized.rider.type,
                            }
                            : order.courier?.rider?.name
                            ? {
                                name: order.courier.rider.name,
                                phone: order.courier.rider.phone,
                                type: order.courier.rider.type,
                            }
                            : undefined,
                    });

                    await order.save();

                    // Emit real-time Socket.io event for admin & client
                    socketService.emitOrderStatusUpdate(order._id.toString(), {
                        orderId: order._id,
                        status: normalized.status,
                        tracking: {
                            ...normalized,
                            rider: order.courier?.rider,
                        },
                        rider: order.courier?.rider,
                    });
                }
            } catch (error: any) {
                console.error(`[CourierSync] Failed to sync order ${order._id}:`, error.message);
            }
        }
    } catch (error: any) {
        console.error("[CourierSync] Sync cycle error:", error.message);
    }
};

// ── Start the polling timer ──────────────────────────────────────────────────
let syncTimer: ReturnType<typeof setInterval> | null = null;

export function startCourierSync() {
    if (syncTimer) return; // already running

    // Run once immediately after a short delay (let DB connect first)
    setTimeout(() => {
        syncCourierStatus();
    }, 10_000);

    // Then repeat every SYNC_INTERVAL_MS
    syncTimer = setInterval(syncCourierStatus, SYNC_INTERVAL_MS);
    console.log(`[CourierSync] Polling active – syncing every ${SYNC_INTERVAL_MS / 1000}s`);
}

export function stopCourierSync() {
    if (syncTimer) {
        clearInterval(syncTimer);
        syncTimer = null;
    }
}

// Auto-start on import
startCourierSync();
