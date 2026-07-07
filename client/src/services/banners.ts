const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5001/api/v1';

export interface PromotionalBannerData {
    _id: string;
    imageUrl: string;
    destinationUrl: string;
    isActive: boolean;
    createdAt: string;
}

export const getBanners = async (): Promise<{ success: boolean; data: PromotionalBannerData[] } | null> => {
    const url = `${baseUrl}/banners`;
    try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
            console.error(`[getBanners] Fetch failed. URL: ${url}, Status: ${res.status}`);
            return null;
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
        console.error(`[getBanners] Error fetching banners data. URL: ${url}, Error:`, error.message || error);
        return null;
    }
};
