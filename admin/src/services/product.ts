import { secureFetch } from "../lib/secureFetch";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5001/api/v1";

export interface DeliveryChargeItem {
    text: string;
    price: number;
}

/** A single color variant with its own image gallery and optional price/stock overrides. */
export interface ProductVariant {
    _id?: string;
    color: {
        name: string;
        hex: string;
    };
    sku?: string;
    stock: number;
    quantity_on_hand: number;
    quantity_reserved?: number;
    /** If set, overrides the base product price for this variant. */
    price?: number | null;
    /** If set, overrides the base product sale_price for this variant. */
    sale_price?: number | null;
    images: string[];
}

export interface ProductData {
    _id?: string;
    productId?: string;
    name: string;
    slug: string;
    price: number;
    vatPercentage?: number;
    originalPrice?: number;
    base_price?: number;
    offerType?: "NONE" | "PERCENTAGE" | "DIRECT";
    offerValue?: number;
    sale_price?: number;
    is_on_sale?: boolean;
    /** New structured variant system. */
    variants?: ProductVariant[];
    /** Legacy flat gallery — used when variants[] is empty or absent. */
    images: string[];
    thumbnail: string;
    description: string;
    fabric?: string;
    fit?: string;
    /** Legacy flat color list — used when variants[] is empty or absent. */
    colors: string[];
    sizes: string[];
    highlights: string[];
    careInstructions: string[];
    deliveryCharge: DeliveryChargeItem[];
    stock: number;
    quantity_on_hand: number;
    quantity_reserved?: number;
    isActive: boolean;
    categoryAssignment?: "TOP" | "MIDDLE" | "BOTTOM";
    /** Reference to the Category document (populated or ObjectId string) */
    category?: string | { _id: string; name: string; slug: string; isActive: boolean; sortOrder: number } | null;
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
