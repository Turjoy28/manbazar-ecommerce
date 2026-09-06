import { Order } from "../../models/order.model.js";
import { WebhookEvent } from "../../models/webhook-event.model.js";
import { normalizeCourierStatus } from "./courier.mapper.js";
import { socketService } from "../socket/socket.service.js";

export class CourierWebhookService {
    async process(params: { provider: string; payload: any; headers: any }) {
        const { provider, payload, headers } = params;
        const normalized = normalizeCourierStatus(provider, payload);

        // 1. Check idempotency (prevent duplicates)
        let event = await WebhookEvent.findOne({ eventId: normalized.eventId });
        if (event && event.processed) {
            console.log(`Webhook event ${normalized.eventId} already processed. Skipping.`);
            return;
        }

        if (!event) {
            event = await WebhookEvent.create({
                provider,
                eventId: normalized.eventId,
                payload,
                processed: false,
            });
        }

        try {
            // 2. Find associated order
            const order = await Order.findOne({ "courier.consignmentId": normalized.consignmentId });
            if (!order) {
                throw new Error(`Order not found for consignment: ${normalized.consignmentId}`);
            }

            // Prevent duplicate tracking entries by event ID
            const alreadyExists = order.trackingHistory?.some((item: any) => item.eventId === normalized.eventId);
            if (!alreadyExists) {
                order.status = normalized.status as any;
                if (!order.courier) {
                    order.courier = { provider, consignmentId: normalized.consignmentId } as any;
                }
                order.courier!.rawStatus = normalized.rawStatus;
                order.courier!.lastSyncedAt = new Date();

                order.trackingHistory.push({
                    status: normalized.status,
                    rawStatus: normalized.rawStatus,
                    message: normalized.message,
                    location: (normalized as any).location || "",
                    provider,
                    eventId: normalized.eventId,
                    timestamp: normalized.timestamp,
                });

                await order.save();

                // 3. Emit real-time Socket.io event
                socketService.emitOrderStatusUpdate(order._id.toString(), {
                    orderId: order._id,
                    status: normalized.status,
                    tracking: normalized,
                });
            }

            // Mark event as processed
            event.processed = true;
            event.processedAt = new Date();
            await event.save();
        } catch (error: any) {
            event.error = error.message;
            await event.save();
            throw error;
        }
    }
}

export const courierWebhookService = new CourierWebhookService();
