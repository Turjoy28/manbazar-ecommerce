import { PromotionalBanner } from "../../models/promotional-banner.model.js";

const createBanner = async (payload: { imageUrl: string; destinationUrl?: string }) => {
    const result = await PromotionalBanner.create(payload);
    return result;
};

const getAllBanners = async () => {
    // Only return active banners for the storefront, or all for the dashboard
    const result = await PromotionalBanner.find().sort({ createdAt: -1 });
    return result;
};

const deleteBanner = async (id: string) => {
    const result = await PromotionalBanner.findByIdAndDelete(id);
    return result;
};

const updateBanner = async (id: string, payload: Partial<{ imageUrl: string; destinationUrl: string; isActive: boolean }>) => {
    const result = await PromotionalBanner.findByIdAndUpdate(id, { $set: payload }, { new: true });
    return result;
};

export const bannersService = {
    createBanner,
    getAllBanners,
    deleteBanner,
    updateBanner,
};
