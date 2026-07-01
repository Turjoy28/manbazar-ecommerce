import { baseUrl } from "./product";

export interface OrderPayload {
    customer: {
        name: string;
        phone: string;
        address: string;
        location: string;
        paymantMethod: string;
    };
    products: {
        productId: string;
        name: string;
        quantity: number;
        price: number;
        size?: string;
        color?: string;
    }[];
    subtotal: number;
    deliveryCharge: number;
    total: number;
}

export interface OrderResponse {
    success: boolean;
    message: string;
    data?: any;
}

export const createOrder = async (payload: OrderPayload): Promise<OrderResponse> => {
    const res = await fetch(`${baseUrl}/orders`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
    
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create order");
    }
    
    return res.json();
};
