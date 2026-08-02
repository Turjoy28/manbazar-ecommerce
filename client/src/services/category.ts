const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5001/api/v1';

export interface ClientCategory {
    _id: string;
    name: string;
    slug: string;
    description: string;
    isActive: boolean;
    sortOrder: number;
}

export interface CategoryListResponse {
    success: boolean;
    message?: string;
    data: ClientCategory[];
}

/** Fetch all active categories (public endpoint) */
export const getCategories = async (): Promise<CategoryListResponse> => {
    const url = `${baseUrl}/categories`;
    try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
            console.error(`[getCategories] Fetch failed. URL: ${url}, Status: ${res.status} ${res.statusText}`);
            return { success: false, data: [] };
        }
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const bodyText = await res.text();
            console.error(`[getCategories] Non-JSON response. URL: ${url}, Content-Type: ${contentType}. Body: ${bodyText.substring(0, 300)}`);
            return { success: false, data: [] };
        }
        return await res.json();
    } catch (error: any) {
        if (
            error.name === 'DynamicServerError' ||
            error.message?.includes('Dynamic server usage') ||
            error.digest === 'NEXT_REDIRECT' ||
            error.digest === 'NEXT_NOT_FOUND'
        ) {
            throw error;
        }
        console.error(`[getCategories] Error fetching categories. URL: ${url}, Error:`, error.message || error);
        return { success: false, data: [] };
    }
};
