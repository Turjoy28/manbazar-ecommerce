import { secureFetch } from "../lib/secureFetch";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5001/api/v1";

export interface DeliveryChargeItem {
    text: string;
    price: number;
}

export interface ProductData {
    _id?: string;
    name: string;
    slug: string;
    price: number;
    originalPrice?: number;
    images: string[];
    thumbnail: string;
    description: string;
    fabric?: string;
    fit?: string;
    colors: string[];
    sizes: string[];
    highlights: string[];
    careInstructions: string[];
    deliveryCharge: DeliveryChargeItem[];
    stock: number;
    isActive: boolean;
    categoryAssignment?: "TOP" | "MIDDLE" | "BOTTOM";
    /** Optional external video URL (YouTube, Instagram Reel, TikTok, etc.) */
    videoUrl?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ProductListResponse {
    success: boolean;
    message?: string;
    data: {
        products: ProductData[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

export interface SingleProductResponse {
    success: boolean;
    message?: string;
    data: ProductData;
}

export const productService = {
    getProducts: async (page = 1, limit = 50): Promise<ProductListResponse> => {
        return secureFetch<ProductListResponse>(`${BASE_URL}/products/admin/all?page=${page}&limit=${limit}`);
    },

    getProductById: async (id: string): Promise<SingleProductResponse> => {
        return secureFetch<SingleProductResponse>(`${BASE_URL}/products/${id}`);
    },

    createProduct: async (payload: Omit<ProductData, "_id">): Promise<SingleProductResponse> => {
        return secureFetch<SingleProductResponse>(`${BASE_URL}/products`, {
            method: "POST",
            body: payload,
        });
    },

    updateProduct: async (id: string, payload: Partial<ProductData>): Promise<SingleProductResponse> => {
        return secureFetch<SingleProductResponse>(`${BASE_URL}/products/${id}`, {
            method: "PATCH",
            body: payload,
        });
    },

    deleteProduct: async (id: string): Promise<any> => {
        return secureFetch<any>(`${BASE_URL}/products/${id}`, {
            method: "DELETE",
        });
    },
};
