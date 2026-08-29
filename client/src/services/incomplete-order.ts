import { baseUrl } from "./product";

export interface IncompleteOrderPayload {
    sessionId: string;
    customer: {
        name: string;
        phone: string;
        email?: string;
        address: string;
        location: string;
    };
    products: {
        productId: string;
        name: string;
        price: number;
        quantity: number;
        size?: string;
        color?: string;
        thumbnail?: string;
    }[];
    totalPrice: number;
    paymentMethod: string;
}

/**
 * Fire-and-forget POST to save/update an incomplete order.
 * Errors are silently caught — this should never interrupt the user.
 */
export const saveIncompleteOrder = async (payload: IncompleteOrderPayload): Promise<void> => {
    try {
        await fetch(`${baseUrl}/incomplete-orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
    } catch {
        // Silently ignore — incomplete order tracking is best-effort
    }
};
