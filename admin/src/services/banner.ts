import { secureFetch } from "../lib/secureFetch";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5001/api/v1";

export interface PromotionalBannerData {
    _id: string;
    imageUrl: string;
    destinationUrl: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export const bannerService = {
    listBanners: async (): Promise<{ success: boolean; data: PromotionalBannerData[] }> => {
        return secureFetch(`${BASE_URL}/banners`);
    },

    createBanner: async (imageUrl: string, destinationUrl?: string): Promise<any> => {
        return secureFetch(`${BASE_URL}/banners`, {
            method: "POST",
            body: { imageUrl, destinationUrl },
        });
    },

    deleteBanner: async (id: string): Promise<any> => {
        return secureFetch(`${BASE_URL}/banners/${id}`, {
            method: "DELETE",
        });
    },

    updateBanner: async (id: string, payload: Partial<{ imageUrl: string; destinationUrl: string; isActive: boolean }>): Promise<any> => {
        return secureFetch(`${BASE_URL}/banners/${id}`, {
            method: "PATCH",
            body: payload,
        });
    },
};
