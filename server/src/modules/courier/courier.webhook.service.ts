import mongoose from "mongoose";
import { Order } from "../../models/order.model.js";
import { WebhookEvent } from "../../models/webhook-event.model.js";
import { normalizeCourierStatus } from "./courier.mapper.js";
import { socketService } from "../socket/socket.service.js";

export class CourierWebhookService {
    async process(params: { provider: string; payload: any; headers: any }) {
        const { provider, payload, headers } = params;
        const normalized = normalizeCourierStatus(provider, payload);

        // 1. Check idempotency (prevent duplicate processing of exact same event)
        let event = await WebhookEvent.findOne({ eventId: normalized.eventId });
        if (event && event.processed) {
            console.log(`[CourierWebhook] Event ${normalized.eventId} already processed. Skipping.`);
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
            // 2. Find associated order with multi-key fallback & strict provider isolation
            const lookupConditions: any[] = [];
            if (normalized.consignmentId) {
                lookupConditions.push({ "courier.consignmentId": normalized.consignmentId });
                lookupConditions.push({ "courier.trackingCode": normalized.consignmentId });
                lookupConditions.push({ "courier.merchantOrderId": normalized.consignmentId });
                lookupConditions.push({ courierConsignmentId: normalized.consignmentId });
                lookupConditions.push({ courierTrackingCode: normalized.consignmentId });
            }
            if (payload.consignment_id) {
                lookupConditions.push({ "courier.consignmentId": String(payload.consignment_id) });
            }
            if (payload.tracking_code) {
                lookupConditions.push({ "courier.trackingCode": String(payload.tracking_code) });
            }
            if (payload.invoice && mongoose.Types.ObjectId.isValid(payload.invoice)) {
                lookupConditions.push({ _id: payload.invoice });
            }
            if (payload.merchant_order_id && mongoose.Types.ObjectId.isValid(payload.merchant_order_id)) {
                lookupConditions.push({ _id: payload.merchant_order_id });
            }
            if (normalized.consignmentId && mongoose.Types.ObjectId.isValid(normalized.consignmentId)) {
                lookupConditions.push({ _id: normalized.consignmentId });
            }

            const queryConditions = lookupConditions.length
                ? { $or: lookupConditions }
                : { "courier.consignmentId": normalized.consignmentId };

            const order: any = await Order.findOne(queryConditions as any);

            if (!order) {
                throw new Error(`Order not found for ${provider} consignment/invoice: ${normalized.consignmentId}`);
            }

            // Reject cross-courier webhook contamination
            if (order.courier?.provider && order.courier.provider !== provider) {
                console.warn(
                    `[CourierWebhook] Ignored cross-courier webhook: Order ${order._id} is assigned to '${order.courier.provider}', ignoring webhook from '${provider}'.`
                );
                return;
            }

            // 3. Update order state & rider pipeline
            const alreadyExists = order.trackingHistory?.some((item: any) => item.eventId === normalized.eventId);
            if (!alreadyExists) {
                order.status = normalized.status as any;
                if (!order.courier) {
                    order.courier = { provider, consignmentId: normalized.consignmentId } as any;
                }
                order.courier!.rawStatus = normalized.rawStatus;
                order.courier!.lastSyncedAt = new Date();

                // Save or update rider assignment in courier details
                if (normalized.rider?.name || normalized.rider?.phone) {
                    order.courier!.rider = {
                        name: normalized.rider.name || order.courier!.rider?.name || "",
                        phone: normalized.rider.phone || order.courier!.rider?.phone || "",
                        type: normalized.rider.type || (normalized.status === "courier_assigned" ? "pickup" : "delivery"),
                        assignedAt: new Date(),
                    };
                    console.log(`[RiderPipeline] Assigned rider to order ${order._id}:`, order.courier!.rider);
                }

                // If delivered and Cash on Delivery, mark payment as completed
                if (normalized.status === "delivered" && order.paymentMethod === "cod") {
                    order.paymentStatus = "completed";
                }

                // Also update legacy fields for backward compatibility
                (order as any).courierStatus = normalized.rawStatus;

                // Push tracking entry
                order.trackingHistory.push({
                    status: normalized.status,
                    rawStatus: normalized.rawStatus,
                    message: normalized.message,
                    location: (normalized as any).location || "",
                    provider,
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

                // 4. Emit real-time Socket.io event with rider info
                socketService.emitOrderStatusUpdate(order._id.toString(), {
                    orderId: order._id,
                    status: normalized.status,
                    tracking: {
                        ...normalized,
                        rider: order.courier?.rider,
                    },
                    rider: order.courier?.rider,
                });

                console.log(`[CourierWebhook] Order ${order._id} updated → ${normalized.status} (Rider: ${order.courier?.rider?.name || "None"})`);
            }

            // Mark webhook event as processed
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

