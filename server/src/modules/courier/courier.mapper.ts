export interface INormalizedCourierStatus {
    consignmentId: string;
    rawStatus: string;
    status: string;
    message: string;
    eventId: string;
    timestamp: Date;
    rider?: {
        name: string;
        phone: string;
        type: "pickup" | "delivery";
    };
    location?: string;
}

export const PATHAO_STATUS_MAP: Record<string, string> = {
    // Standard Pathao webhook events
    "order.created": "courier_assigned",
    "order.accepted": "processing",
    "order.pickup_requested": "processing",
    "order.assigned_for_pickup": "courier_assigned",
    "order.picked": "picked_up",
    "order.picked_up": "picked_up",
    "order.in_transit": "in_transit",
    "order.assigned_for_delivery": "out_for_delivery",
    "order.out_for_delivery": "out_for_delivery",
    "order.rider_assigned": "out_for_delivery",
    "order.delivered": "delivered",
    "order.cancelled": "cancelled",
    "order.hold": "processing",
    "order.returned": "returned",
    "order.partial_delivered": "delivered",

    // Plain event / status strings from tracking query or payload
    "created": "courier_assigned",
    "pending": "courier_assigned",
    "assigned": "courier_assigned",
    "pickup_requested": "processing",
    "assigned_for_pickup": "courier_assigned",
    "pickup_rider_assigned": "courier_assigned",
    "accepted": "processing",
    "picked": "picked_up",
    "picked_up": "picked_up",
    "in_transit": "in_transit",
    "assigned_for_delivery": "out_for_delivery",
    "out_for_delivery": "out_for_delivery",
    "rider_assigned": "out_for_delivery",
    "delivery_assigned": "out_for_delivery",
    "delivery_rider_assigned": "out_for_delivery",
    "delivered": "delivered",
    "partial_delivered": "delivered",
    "cancelled": "cancelled",
    "returned": "returned",
    "hold": "processing",
};

// Official Steadfast statuses (from portal.packzy.com API docs):
//   in_review, pending, hold, delivered, partial_delivered, cancelled,
//   delivered_approval_pending, partial_delivered_approval_pending,
//   cancelled_approval_pending, unknown_approval_pending, unknown
//
// Webhook-pushed statuses (from live webhook payloads — not all documented):
//   dispatched, assigned_for_pickup, picked_up, in_transit,
//   out_for_delivery, rider_assigned, deliveryman_assigned, etc.
export const STEADFAST_STATUS_MAP: Record<string, string> = {
    // ── Official status-check API statuses ──────────────────────────────────
    "in_review":                          "processing",       // Created, awaiting Steadfast review
    "pending":                            "courier_assigned", // Approved by Steadfast, awaiting pickup
    "hold":                               "processing",       // On hold

    // ── Delivery approval pipeline ───────────────────────────────────────────
    "delivered_approval_pending":         "delivered",        // Delivered, admin approval pending
    "partial_delivered_approval_pending": "processing",       // Partially delivered, pending
    "cancelled_approval_pending":         "cancelled",        // Cancelled, pending
    "unknown_approval_pending":           "processing",       // Unknown, needs support

    // ── Final statuses ───────────────────────────────────────────────────────
    "delivered":                          "delivered",
    "partial_delivered":                  "delivered",
    "cancelled":                          "cancelled",
    "returned":                           "returned",
    "unknown":                            "processing",

    // ── Webhook-only statuses (live push, not in status-check docs) ──────────
    "dispatched":                         "courier_assigned",
    "assigned_for_pickup":                "courier_assigned",
    "picked":                             "picked_up",
    "picked_up":                          "picked_up",
    "in_transit":                         "in_transit",
    "out_for_delivery":                   "out_for_delivery",
    "delivering":                         "out_for_delivery",
    "assigned_for_delivery":              "out_for_delivery",
    "assigned_rider":                     "out_for_delivery",
    "rider_assigned":                     "out_for_delivery",
    "deliveryman_assigned":               "out_for_delivery",
    "delivery_man_assigned":              "out_for_delivery",
};

export const CARRYBEE_STATUS_MAP: Record<string | number, string> = {
    1: "courier_assigned",
    2: "processing",
    3: "picked_up",
    4: "in_transit",
    5: "delivered",
    6: "cancelled",
    7: "returned",
    8: "out_for_delivery",
    "order.created": "courier_assigned",
    "order.picked": "picked_up",
    "order.in_transit": "in_transit",
    "order.assigned_for_delivery": "out_for_delivery",
    "order.out_for_delivery": "out_for_delivery",
    "order.rider_assigned": "out_for_delivery",
    "out_for_delivery": "out_for_delivery",
    "rider_assigned": "out_for_delivery",
    "assigned_for_delivery": "out_for_delivery",
    "assigned_rider": "out_for_delivery",
    "deliveryman_assigned": "out_for_delivery",
    "assigned_for_pickup": "courier_assigned",
    "pickup_rider_assigned": "courier_assigned",
    "order.delivered": "delivered",
    "order.cancelled": "cancelled",
    "order.returned": "returned",
    "delivered": "delivered",
    "cancelled": "cancelled",
    "returned": "returned",
    "picked": "picked_up",
    "picked_up": "picked_up",
    "in_transit": "in_transit",
    "pending": "courier_assigned",
};

export const normalizeCourierStatus = (provider: string, payload: any): INormalizedCourierStatus => {
    switch (provider) {
        case "pathao": {
            const latestLog = Array.isArray(payload.data) ? payload.data[payload.data.length - 1] : payload.data;
            const rawEvent = (
                payload.event ||
                latestLog?.order_status_slug ||
                latestLog?.order_status ||
                payload.order_status ||
                "processing"
            ).toString().toLowerCase().trim();

            const mappedStatus =
                PATHAO_STATUS_MAP[rawEvent] ||
                PATHAO_STATUS_MAP[`order.${rawEvent}`] ||
                "processing";

            const consignmentId = payload.consignment_id || latestLog?.consignment_id || payload.merchant_order_id || "";
            const timestamp = payload.timestamp || latestLog?.created_at || Date.now();

            // Extract Pathao rider details if present in payload or log
            const rawRiderName =
                payload.delivery_rider_name ||
                payload.rider_name ||
                latestLog?.delivery_rider_name ||
                latestLog?.rider_name ||
                payload.pickup_rider_name ||
                latestLog?.pickup_rider_name ||
                payload.rider?.name ||
                "";

            const rawRiderPhone =
                payload.delivery_rider_phone ||
                payload.rider_phone ||
                latestLog?.delivery_rider_phone ||
                latestLog?.rider_phone ||
                payload.pickup_rider_phone ||
                latestLog?.pickup_rider_phone ||
                payload.rider?.phone ||
                "";

            const isPickup = rawEvent.includes("pickup") || mappedStatus === "courier_assigned";
            const riderType: "pickup" | "delivery" = isPickup ? "pickup" : "delivery";

            const rider = (rawRiderName || rawRiderPhone)
                ? {
                    name: String(rawRiderName).trim(),
                    phone: String(rawRiderPhone).trim(),
                    type: riderType,
                }
                : undefined;

            let message = payload.message || latestLog?.message;
            if (!message) {
                if (mappedStatus === "out_for_delivery" && rider?.name) {
                    message = `Out for delivery with rider: ${rider.name}${rider.phone ? ` (${rider.phone})` : ""}`;
                } else if (mappedStatus === "courier_assigned" && rider?.name) {
                    message = `Pickup rider assigned: ${rider.name}${rider.phone ? ` (${rider.phone})` : ""}`;
                } else {
                    message = `Pathao status: ${mappedStatus}`;
                }
            }

            return {
                consignmentId: String(consignmentId),
                rawStatus: String(rawEvent),
                status: mappedStatus,
                message,
                eventId: `${consignmentId || "pathao"}-${rawEvent}-${timestamp}`,
                timestamp: new Date(timestamp),
                rider,
                location: payload.location || latestLog?.location || "",
            };
        }

        case "steadfast": {
            // Steadfast polling returns { status: 200, delivery_status: "delivered" }
            // Steadfast webhook returns { consignment_id, status: "delivered", delivery_status?: "...", updated_at }
            const rawStatus = (
                payload.delivery_status ||
                (payload.status !== 200 ? payload.status : "") ||
                "processing"
            ).toString().toLowerCase().trim();

            const mappedStatus = STEADFAST_STATUS_MAP[rawStatus] || "processing";
            const consignmentId = payload.consignment_id || payload.tracking_code || payload.invoice || "";
            const updatedAt = payload.updated_at || Date.now();

            // Extract Steadfast rider / deliveryman details from all possible fields
            let rawRiderName =
                payload.rider_name ||
                payload.delivery_man_name ||
                payload.deliveryman_name ||
                payload.delivery_rider_name ||
                payload.rider?.name ||
                payload.deliveryman?.name ||
                payload.data?.rider_name ||
                payload.data?.delivery_man_name ||
                "";

            let rawRiderPhone =
                payload.rider_phone ||
                payload.delivery_man_phone ||
                payload.deliveryman_phone ||
                payload.delivery_rider_phone ||
                payload.rider?.phone ||
                payload.deliveryman?.phone ||
                payload.data?.rider_phone ||
                payload.data?.delivery_man_phone ||
                payload.rider_contact ||
                "";

            // Fallback: If rider info is embedded in tracking_message / note
            const textContent = payload.tracking_message || payload.message || payload.note || "";
            if ((!rawRiderName || !rawRiderPhone) && typeof textContent === "string" && textContent) {
                const phoneMatch = textContent.match(/(?:\+?88)?(01[3-9]\d{8})/);
                if (phoneMatch && !rawRiderPhone) {
                    rawRiderPhone = phoneMatch[1];
                }
                const nameMatch = textContent.match(/(?:rider|delivery\s*man|deliveryman|agent|driver)\s*(?:name)?[:\s\-]+([a-zA-Z\s\.]+?)(?:[\(\,\-]|\s+(?:contact|phone|mobile|\d))/i);
                if (nameMatch && !rawRiderName) {
                    rawRiderName = nameMatch[1].trim();
                }
            }

            const isPickup = rawStatus.includes("pickup") || mappedStatus === "courier_assigned";
            const riderType: "pickup" | "delivery" = isPickup ? "pickup" : "delivery";

            const rider = (rawRiderName || rawRiderPhone)
                ? {
                    name: String(rawRiderName || "Assigned Delivery Rider").trim(),
                    phone: String(rawRiderPhone).trim(),
                    type: riderType,
                }
                : undefined;

            let message = payload.tracking_message || payload.message;
            if (!message) {
                if (mappedStatus === "out_for_delivery" && rider?.name) {
                    message = `Out for delivery with rider: ${rider.name}${rider.phone ? ` (${rider.phone})` : ""}`;
                } else if (mappedStatus === "courier_assigned" && rider?.name) {
                    message = `Pickup rider assigned: ${rider.name}${rider.phone ? ` (${rider.phone})` : ""}`;
                } else {
                    message = `Steadfast status: ${mappedStatus}`;
                }
            }

            return {
                consignmentId: String(consignmentId),
                rawStatus: String(rawStatus),
                status: mappedStatus,
                message,
                eventId: `${consignmentId || "sf"}-${rawStatus}-${updatedAt}`,
                timestamp: payload.updated_at ? new Date(payload.updated_at) : new Date(),
                rider,
                location: payload.location || "",
            };
        }

        case "carrybee": {
            const orderData = payload.data?.order || payload.order || payload.data || payload;
            const consignmentId =
                orderData.consignment_id ||
                payload.consignmentId ||
                payload.consignment_id ||
                orderData.merchant_order_id ||
                payload.merchant_order_id ||
                "";

            const rawStatus = (
                orderData.transfer_status_id ??
                payload.transfer_status_id ??
                payload.status ??
                payload.event ??
                "unknown"
            ).toString().toLowerCase().trim();

            let mappedStatus = CARRYBEE_STATUS_MAP[rawStatus] || "processing";
            const updatedAt = orderData.updated_at?.created_at || orderData.updated_at || payload.updated_at || Date.now();

            const rawRiderName =
                orderData.rider_name ||
                orderData.rider?.name ||
                payload.rider_name ||
                payload.rider?.name ||
                orderData.delivery_man_name ||
                orderData.delivery_rider_name ||
                payload.delivery_rider_name ||
                "";

            const rawRiderPhone =
                orderData.rider_phone ||
                orderData.rider?.phone ||
                payload.rider_phone ||
                payload.rider?.phone ||
                orderData.delivery_man_phone ||
                orderData.delivery_rider_phone ||
                payload.delivery_rider_phone ||
                "";

            const isPickup = rawStatus.includes("pickup") || mappedStatus === "courier_assigned";
            const riderType: "pickup" | "delivery" = isPickup ? "pickup" : "delivery";

            // If rider is assigned and status was in_transit or processing, transition to out_for_delivery
            if ((rawRiderName || rawRiderPhone) && !isPickup && (mappedStatus === "in_transit" || mappedStatus === "processing")) {
                mappedStatus = "out_for_delivery";
            }

            const rider = (rawRiderName || rawRiderPhone)
                ? {
                    name: String(rawRiderName).trim(),
                    phone: String(rawRiderPhone).trim(),
                    type: riderType,
                }
                : undefined;

            let message = payload.message || orderData.message;
            if (!message) {
                if (mappedStatus === "out_for_delivery" && rider?.name) {
                    message = `Out for delivery with rider: ${rider.name}${rider.phone ? ` (${rider.phone})` : ""}`;
                } else if (mappedStatus === "courier_assigned" && rider?.name) {
                    message = `Pickup rider assigned: ${rider.name}${rider.phone ? ` (${rider.phone})` : ""}`;
                } else {
                    message = `CarryBee status: ${mappedStatus}`;
                }
            }

            return {
                consignmentId: String(consignmentId),
                rawStatus: String(rawStatus),
                status: mappedStatus,
                message,
                eventId: `${consignmentId || "cb"}-${rawStatus}-${updatedAt}`,
                timestamp: new Date(),
                rider,
                location: payload.location || orderData.location || "",
            };
        }

        default:
            throw new Error(`Unknown courier provider: ${provider}`);
    }
};
