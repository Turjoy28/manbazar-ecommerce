import { secureFetch } from "../lib/secureFetch";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5001/api/v1";

export interface OrderItem {
    id: string;
    productId?: string;
    name: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
}

export interface OrderCustomer {
    name: string;
    phone: string;
    address: string;
    location: string;
    paymentMethod: string;
    transactionId?: string;
    senderNumber?: string;
}

export interface OrderData {
    _id: string;
    orderNumber?: string;
    products: OrderItem[];
    customer: OrderCustomer;
    coupon?: string;
    subtotal: number;
    deliveryCharge: number;
    total: number;
    /** Top-level payment method: 'bkash' or 'cod' */
    paymentMethod: "bkash" | "cod";
    /** Lifecycle state of the payment */
    paymentStatus: "pending" | "completed" | "failed" | "refunded";
    /** Transaction ID (bKash orders only) */
    bkashTxnId?: string | null;
    status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
    courierName?: string;
    courierTrackingCode?: string;
    courierStatus?: string;
    courierConsignmentId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface OrderListResponse {
    success: boolean;
    message?: string;
    data: {
        orders: OrderData[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

export interface OrderStatsResponse {
    success: boolean;
    data: {
        totalOrders: number;
        totalRevenue: number;
        pendingOrders: number;
        deliveredOrders: number;
        cancelledOrders: number;
        totalProducts: number;
    };
}

export interface MonthlyDataItem {
    _id: { year: number; month: number; day: number };
    orders: number;
    revenue: number;
}

export interface OrderMonthlyResponse {
    success: boolean;
    data: MonthlyDataItem[];
}

export const orderService = {
    /** Fetch paginated orders list (passes token for server-side calls) */
    getOrders: async (page = 1, limit = 10, token?: string): Promise<OrderListResponse> => {
        return secureFetch<OrderListResponse>(`${BASE_URL}/orders?page=${page}&limit=${limit}`, {
            ...(token && { token }),
        });
    },

    /** Update a single order status */
    updateOrderStatus: async (id: string, status: string, token?: string): Promise<any> => {
        return secureFetch<any>(`${BASE_URL}/orders/${id}/status`, {
            method: "PATCH",
            body: { status },
            ...(token && { token }),
        });
    },

    /** Fully update an order */
    updateOrder: async (id: string, payload: any, token?: string): Promise<any> => {
        return secureFetch<any>(`${BASE_URL}/orders/${id}`, {
            method: "PUT",
            body: payload,
            ...(token && { token }),
        });
    },

    /** Bulk delete orders by IDs */
    deleteOrders: async (ids: string[], token?: string): Promise<any> => {
        return secureFetch<any>(`${BASE_URL}/orders`, {
            method: "DELETE",
            body: { ids },
            ...(token && { token }),
        });
    },

    /** Send selected orders to a courier service */
    sendToCourier: async (
        orderIds: string[],
        courier: "steadfast" | "pathao" | "redx",
        token?: string
    ): Promise<any> => {
        return secureFetch<any>(`${BASE_URL}/courier/send`, {
            method: "POST",
            body: { orderIds, courier },
            ...(token && { token }),
        });
    },

    /**
     * Dashboard aggregate stats
     * token is required when called from a Next.js Server Component
     * because cookies() are not automatically forwarded in server-side fetch
     */
    getOrderStats: async (token?: string): Promise<OrderStatsResponse> => {
        return secureFetch<OrderStatsResponse>(`${BASE_URL}/orders/stats`, {
            ...(token && { token }),
        });
    },

    /**
     * Daily chart data (last 90 days)
     * token is required when called from a Next.js Server Component
     */
    getMonthlyData: async (token?: string): Promise<OrderMonthlyResponse> => {
        return secureFetch<OrderMonthlyResponse>(`${BASE_URL}/orders/monthly`, {
            ...(token && { token }),
        });
    },

    /** Mark a COD order as paid (admin reconciliation) */
    reconcilePayment: async (id: string, token?: string): Promise<any> => {
        return secureFetch<any>(`${BASE_URL}/orders/${id}/reconcile`, {
            method: "PATCH",
            ...(token && { token }),
        });
    },
};
