export const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000/api/v1';

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
    const res = await fetch(`${baseUrl}/products?page=${page}&limit=${limit}`, { cache: "no-store" });
    if (!res.ok) {
        throw new Error("Failed to fetch products");
    }
    return res.json();
};

export const getProductBySlug = async (slug: string): Promise<SingleProductResponse> => {
    const res = await fetch(`${baseUrl}/products/slug/${slug}`, { cache: "no-store" });
    if (!res.ok) {
        throw new Error("Failed to fetch product");
    }
    return res.json();
};
