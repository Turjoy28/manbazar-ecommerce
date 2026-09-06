export const PATHAO_STATUS_MAP: Record<string, string> = {
    "order.created": "courier_assigned",
    "order.accepted": "processing",
    "order.pickup_requested": "processing",
    "order.picked": "picked_up",
    "order.in_transit": "in_transit",
    "order.delivered": "delivered",
    "order.cancelled": "cancelled",
    "order.hold": "processing",
    "order.returned": "returned",
    "order.partial_delivered": "delivered",
};

export const STEADFAST_STATUS_MAP: Record<string, string> = {
    "pending": "courier_assigned",
    "in_review": "processing",
    "hold": "processing",
    "delivered": "delivered",
    "partial_delivered": "delivered",
    "cancelled": "cancelled",
    "unknown": "processing",
    "delivered_approval_pending": "delivered",
    "partial_delivered_approval_pending": "processing",
    "cancelled_approval_pending": "cancelled",
};

export const normalizeCourierStatus = (provider: string, payload: any) => {
    switch (provider) {
        case "pathao":
            return {
                consignmentId: payload.consignment_id,
                rawStatus: payload.event,
                status: PATHAO_STATUS_MAP[payload.event] || "processing",
                message: payload.message || payload.event,
                eventId: `${payload.consignment_id}-${payload.event}-${payload.timestamp}`,
                timestamp: new Date(payload.timestamp),
            };
        case "steadfast":
            return {
                consignmentId: payload.consignment_id,
                rawStatus: payload.status,
                status: STEADFAST_STATUS_MAP[payload.status] || "processing",
                message: payload.tracking_message,
                eventId: `${payload.consignment_id}-${payload.updated_at}`,
                timestamp: new Date(payload.updated_at),
            };
        case "carrybee":
            // Carrybee mapping to be implemented
            return {
                consignmentId: payload.consignmentId,
                rawStatus: payload.status,
                status: "processing",
                message: "Status updated",
                eventId: `${payload.consignmentId}-${Date.now()}`,
                timestamp: new Date(),
            };
        default:
            throw new Error(`Unknown courier provider: ${provider}`);
    }
};
