import { secureFetch } from "../lib/secureFetch";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5001/api/v1";

export interface IncompleteOrderProduct {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
    thumbnail?: string;
}

export interface IncompleteOrderCustomer {
    name: string;
    phone: string;
    email?: string;
    address: string;
    location: string;
}

export interface IncompleteOrderData {
    _id: string;
    sessionId: string;
    customer: IncompleteOrderCustomer;
    products: IncompleteOrderProduct[];
    totalPrice: number;
    paymentMethod: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface IncompleteOrderListResponse {
    success: boolean;
    message?: string;
    data: {
        orders: IncompleteOrderData[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

export const incompleteOrderService = {
    /** Fetch paginated incomplete orders (admin) */
    getIncompleteOrders: async (page = 1, limit = 10, token?: string): Promise<IncompleteOrderListResponse> => {
        return secureFetch<IncompleteOrderListResponse>(
            `${BASE_URL}/incomplete-orders?page=${page}&limit=${limit}`,
            { ...(token && { token }) }
        );
    },

    /** Bulk delete incomplete orders by IDs */
    deleteIncompleteOrders: async (ids: string[], token?: string): Promise<any> => {
        return secureFetch<any>(`${BASE_URL}/incomplete-orders`, {
            method: "DELETE",
            body: { ids },
            ...(token && { token }),
        });
    },

    /** Delete a single incomplete order */
    deleteIncompleteOrder: async (id: string, token?: string): Promise<any> => {
        return secureFetch<any>(`${BASE_URL}/incomplete-orders/${id}`, {
            method: "DELETE",
            ...(token && { token }),
        });
    },
};
