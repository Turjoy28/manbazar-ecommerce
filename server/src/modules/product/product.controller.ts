import { NextFunction, Request, Response } from "express";
import { productService } from "./product.service.js";
import sendResponse from "../../utils/sendResponse.js";

/** POST /products — Create a new product (admin) */
const createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await productService.createProduct(req.body);
        sendResponse(res, { statusCode: 201, success: true, message: "Product created successfully", data: result });
    } catch (error) { next(error); }
};

/** GET /products — Get all products (public, active only) */
const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 50;
        const result = await productService.getAllProducts(page, limit);
        sendResponse(res, { statusCode: 200, success: true, message: "Products fetched successfully", data: result });
    } catch (error) { next(error); }
};

/** GET /products/admin — Get all products for admin (includes inactive) */
const getAllProductsAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 50;
        const result = await productService.getAllProductsAdmin(page, limit);
        sendResponse(res, { statusCode: 200, success: true, message: "Products fetched successfully", data: result });
    } catch (error) { next(error); }
};

/** GET /products/slug/:slug — Get product by slug (public) */
const getProductBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await productService.getProductBySlug(req.params.slug as string);
        if (!result) { res.status(404).json({ success: false, message: "Product not found" }); return; }
        sendResponse(res, { statusCode: 200, success: true, message: "Product fetched successfully", data: result });
    } catch (error) { next(error); }
};

/** GET /products/:id — Get product by ID (admin) */
const getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await productService.getProductById(req.params.id as string);
        if (!result) { res.status(404).json({ success: false, message: "Product not found" }); return; }
        sendResponse(res, { statusCode: 200, success: true, message: "Product fetched successfully", data: result });
    } catch (error) { next(error); }
};

/** PATCH /products/:id — Update a product (admin) */
const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await productService.updateProduct(req.params.id as string, req.body);
        if (!result) { res.status(404).json({ success: false, message: "Product not found" }); return; }
        sendResponse(res, { statusCode: 200, success: true, message: "Product updated successfully", data: result });
    } catch (error) { next(error); }
};

/** DELETE /products/:id — Delete a product (admin) */
const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await productService.deleteProduct(req.params.id as string);
        if (!result) { res.status(404).json({ success: false, message: "Product not found" }); return; }
        sendResponse(res, { statusCode: 200, success: true, message: "Product deleted successfully", data: result });
    } catch (error) { next(error); }
};

export const productController = {
    createProduct,
    getAllProducts,
    getAllProductsAdmin,
    getProductBySlug,
    getProductById,
    updateProduct,
    deleteProduct,
};