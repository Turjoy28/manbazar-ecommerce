import { secureFetch } from "../lib/secureFetch";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5001/api/v1";

export interface CategoryData {
    _id: string;
    name: string;
    slug: string;
    /** Parent category reference for infinite hierarchy. null = root category. */
    parent?: string | { _id: string; name: string; slug: string } | null;
    description: string;
    image?: string;
    isActive: boolean;
    sortOrder: number;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CategoryListResponse {
    success: boolean;
    message?: string;
    data: CategoryData[];
}

export interface SingleCategoryResponse {
    success: boolean;
    message?: string;
    data: CategoryData;
}

export const categoryService = {
    /** Get all categories (admin - includes inactive) */
    getCategories: async (): Promise<CategoryListResponse> => {
        return secureFetch<CategoryListResponse>(`${BASE_URL}/categories/admin/all`);
    },

    /** Get a single category by ID */
    getCategoryById: async (id: string): Promise<SingleCategoryResponse> => {
        return secureFetch<SingleCategoryResponse>(`${BASE_URL}/categories/${id}`);
    },

    /** Create a new category */
    createCategory: async (payload: { name: string; description?: string }): Promise<SingleCategoryResponse> => {
        return secureFetch<SingleCategoryResponse>(`${BASE_URL}/categories`, {
            method: "POST",
            body: payload,
        });
    },

    /** Update a category */
    updateCategory: async (id: string, payload: Partial<CategoryData>): Promise<SingleCategoryResponse> => {
        return secureFetch<SingleCategoryResponse>(`${BASE_URL}/categories/${id}`, {
            method: "PATCH",
            body: payload,
        });
    },

    /** Toggle category active/inactive */
    toggleCategory: async (id: string): Promise<SingleCategoryResponse> => {
        return secureFetch<SingleCategoryResponse>(`${BASE_URL}/categories/${id}/toggle`, {
            method: "PATCH",
        });
    },

    /** Reorder categories */
    reorderCategories: async (orderedIds: string[]): Promise<CategoryListResponse> => {
        return secureFetch<CategoryListResponse>(`${BASE_URL}/categories/reorder`, {
            method: "PATCH",
            body: { orderedIds },
        });
    },

    /** Delete a category */
    deleteCategory: async (id: string): Promise<any> => {
        return secureFetch<any>(`${BASE_URL}/categories/${id}`, {
            method: "DELETE",
        });
    },
};
