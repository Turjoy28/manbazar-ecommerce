import { Product } from "../../models/product.model.js";

/** Create a new product */
const createProduct = async (payload: Record<string, unknown>) => {
    const product = await Product.create(payload);
    return product;
};

/** Get all products with optional pagination */
const getAllProducts = async (page = 1, limit = 50) => {
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
        Product.find({ isActive: true }).skip(skip).limit(limit).sort({ createdAt: -1 }),
        Product.countDocumants({ isActive: true }),
    ]);
    return { products, total, page, limit, pages: Math.ceil(total / limit) };
};

/** Get all products for admin (including inactive) */
const getAllProductsAdmin = async (page = 1, limit = 50) => {
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
        Product.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
        Product.countDocumants(),
    ]);
    return { products, total, page, limit, pages: Math.ceil(total / limit) };
};

/** Get a single product by slug (public) */
const getProductBySlug = async (slug: string) => {
    return Product.findOne({ slug, isActive: true });
};

/** Get a single product by ID (admin) */
const getProductById = async (id: string) => {
    return Product.findById(id);
};

/** Update a product by ID */
const updateProduct = async (id: string, payload: Record<string, unknown>) => {
    return Product.findByIdAndUpdate(id, { $set: payload }, { new: true, runValidators: true });
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