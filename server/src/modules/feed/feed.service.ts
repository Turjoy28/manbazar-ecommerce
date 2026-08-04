import { Product } from "../../models/product.model.js";

/** Fetch ALL active products with full data for XML feed generation. */
const getAllProductsForFeed = async () => {
    return Product.find({ isActive: { $ne: false } })
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .lean();
};

export const feedService = {
    getAllProductsForFeed,
};
