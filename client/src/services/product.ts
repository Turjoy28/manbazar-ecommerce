export const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5001/api/v1';

import { Product } from "../types";

export interface ProductListResponse {
    success: boolean;
    data: {
        products: Product[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

export interface SingleProductResponse {
    success: boolean;
    data: Product;
}

export const getProducts = async (page = 1, limit = 50): Promise<ProductListResponse> => {
    const url = `${baseUrl}/products?page=${page}&limit=${limit}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
        throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
    }
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        const bodyText = await res.text();
        console.error(`[getProducts] Non-JSON response received from ${url}. Content-Type: ${contentType}. Body preview: ${bodyText.substring(0, 300)}`);
        throw new Error("Received non-JSON response from server");
    }
    return res.json();
};

export const getProductBySlug = async (slug: string): Promise<SingleProductResponse> => {
    const url = `${baseUrl}/products/slug/${slug}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
        throw new Error(`Failed to fetch product: ${res.status} ${res.statusText}`);
    }
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        const bodyText = await res.text();
        console.error(`[getProductBySlug] Non-JSON response received from ${url}. Content-Type: ${contentType}. Body preview: ${bodyText.substring(0, 300)}`);
        throw new Error("Received non-JSON response from server");
    }
    return res.json();
};
