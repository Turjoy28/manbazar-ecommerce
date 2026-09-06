import { Worker, Job } from "bullmq";
import { redisClient } from "../../config/redis.js";
import { Order } from "../../models/order.model.js";
import { courierManager } from "./courier.manager.js";
import { courierWebhookService } from "./courier.webhook.service.js";
import { normalizeCourierStatus } from "./courier.mapper.js";

const syncCourierStatus = async () => {
    console.log("[Worker] Starting Courier Sync...");
    
    // Find active shipments that are not delivered, cancelled, or returned
    const orders = await Order.find({
        status: { $nin: ["delivered", "cancelled", "returned"] },
        "courier.provider": { $exists: true },
    });

    for (const order of orders) {
        if (!order.courier || !order.courier.provider || !order.courier.trackingCode) {
            continue;
        }

        try {
            const tracking = await courierManager.getTrackingStatus(
                order.courier.provider, 
                order.courier.trackingCode
            );
            
            const normalized = normalizeCourierStatus(order.courier.provider, tracking);

            // Skip if the status hasn't changed
            if (normalized.status === order.status && normalized.rawStatus === order.courier.rawStatus) {
                continue;
            }

            // We can reuse the webhook service to process this update 
            // since the core logic of updating the order and pushing to trackingHistory is identical.
            await courierWebhookService.process({
                provider: order.courier.provider,
                payload: tracking, // Passing raw tracking response as payload
                headers: {},
            });

            console.log(`[Worker] Synced tracking for order ${order._id}`);
        } catch (error: any) {
            console.error(`[Worker] Failed to sync order ${order._id}:`, error.message);
        }
    }
};

export const courierWorker = new Worker(
    "courier-sync-queue",
    async (job: Job) => {
        if (job.name === "sync-status") {
            await syncCourierStatus();
        }
    },
    { connection: redisClient }
);

courierWorker.on("completed", (job) => {
    console.log(`[Worker] Job ${job.id} completed successfully`);
});

courierWorker.on("failed", (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed:`, err.message);
});
