import { Product } from "../../models/product.model.js";

export const computeProductPricing = (payload: any) => {
    let base = payload.base_price !== undefined ? Number(payload.base_price) : Number(payload.price || 0);
    if (isNaN(base) || base === null) {
        base = 0;
    }

    const offerType = payload.offerType || 'NONE';
    let offerValue = Number(payload.offerValue) || 0;
    if (offerType === 'NONE') {
        offerValue = 0;
    }

    let sale_price = base;
    let is_on_sale = false;

    if (offerType === 'PERCENTAGE') {
        is_on_sale = offerValue > 0;
        sale_price = Math.round(base * (1 - offerValue / 100));
    } else if (offerType === 'DIRECT') {
        is_on_sale = offerValue > 0;
        sale_price = Math.round(base - offerValue);
    } else {
        is_on_sale = false;
        sale_price = base;
    }

    return {
        base_price: base,
        offerType,
        offerValue,
        sale_price,
        is_on_sale,
        price: sale_price,
        originalPrice: is_on_sale ? base : null
    };
};

/** Create a new product */
const createProduct = async (payload: Record<string, unknown>) => {
    const pricing = computeProductPricing(payload);
    const product = await Product.create({ ...payload, ...pricing });
    return product;
};

/** Get all products with optional pagination */
const getAllProducts = async (page = 1, limit = 50) => {
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
        Product.find({ isActive: { $ne: false } }).populate("category", "name slug isActive sortOrder").skip(skip).limit(limit).sort({ createdAt: -1 }),
        Product.countDocuments({ isActive: { $ne: false } }),
    ]);
    return { products, total, page, limit, pages: Math.ceil(total / limit) };
};

/** Get all products for admin (including inactive) */
const getAllProductsAdmin = async (page = 1, limit = 50) => {
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
        Product.find().populate("category", "name slug isActive sortOrder").skip(skip).limit(limit).sort({ createdAt: -1 }),
        Product.countDocuments(),
    ]);
    return { products, total, page, limit, pages: Math.ceil(total / limit) };
};

/** Get a single product by slug (public) */
const getProductBySlug = async (slug: string) => {
    return Product.findOne({ slug, isActive: { $ne: false } }).populate("category", "name slug isActive sortOrder");
};

/** Get a single product by ID (admin) */
const getProductById = async (id: string) => {
    return Product.findById(id).populate("category", "name slug isActive sortOrder");
};

/** Update a product by ID */
const updateProduct = async (id: string, payload: Record<string, unknown>) => {
    const existing = await Product.findById(id);
    if (!existing) return null;

    const combined = {
        price: payload.price !== undefined ? payload.price : existing.price,
        base_price: payload.base_price !== undefined ? payload.base_price : existing.base_price,
        offerType: payload.offerType !== undefined ? payload.offerType : existing.offerType,
        offerValue: payload.offerValue !== undefined ? payload.offerValue : existing.offerValue,
    };

    const pricing = computeProductPricing(combined);
    return Product.findByIdAndUpdate(id, { $set: { ...payload, ...pricing } }, { new: true, runValidators: true });
};

/** Delete a product by ID */
const deleteProduct = async (id: string) => {
    return Product.findByIdAndDelete(id);
};

export const productService = {
    createProduct,
    getAllProducts,
    getAllProductsAdmin,
    getProductBySlug,
    getProductById,
    updateProduct,
    deleteProduct,
};