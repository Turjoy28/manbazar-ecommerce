import { NextFunction, Request, Response } from "express";
import { categoryService } from "./category.service.js";
import sendResponse from "../../utils/sendResponse.js";

/** GET /categories — Public: Get all active categories */
const getActiveCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await categoryService.getActiveCategories();
        sendResponse(res, { statusCode: 200, success: true, message: "Active categories fetched successfully", data: result });
    } catch (error) { next(error); }
};

/** GET /categories/admin/all — Admin: Get all categories */
const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await categoryService.getAllCategories();
        sendResponse(res, { statusCode: 200, success: true, message: "All categories fetched successfully", data: result });
    } catch (error) { next(error); }
};

/** GET /categories/:id — Admin: Get category by ID */
const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await categoryService.getCategoryById(req.params.id as string);
        if (!result) { res.status(404).json({ success: false, message: "Category not found" }); return; }
        sendResponse(res, { statusCode: 200, success: true, message: "Category fetched successfully", data: result });
    } catch (error) { next(error); }
};

/** GET /categories/slug/:slug — Public: Get category by slug */
const getCategoryBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await categoryService.getCategoryBySlug(req.params.slug as string);
        if (!result) { res.status(404).json({ success: false, message: "Category not found" }); return; }
        sendResponse(res, { statusCode: 200, success: true, message: "Category fetched successfully", data: result });
    } catch (error) { next(error); }
};

/** POST /categories — Admin: Create a new category */
const createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const admin = (req as any).admin;
        const result = await categoryService.createCategory({
            ...req.body,
            createdBy: admin?.id,
        });
        sendResponse(res, { statusCode: 201, success: true, message: "Category created successfully", data: result });
    } catch (error) { next(error); }
};

/** PATCH /categories/:id — Admin: Update a category */
const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await categoryService.updateCategory(req.params.id as string, req.body);
        if (!result) { res.status(404).json({ success: false, message: "Category not found" }); return; }
        sendResponse(res, { statusCode: 200, success: true, message: "Category updated successfully", data: result });
    } catch (error) { next(error); }
};

/** PATCH /categories/:id/toggle — Admin: Toggle active/inactive */
const toggleCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await categoryService.toggleCategory(req.params.id as string);
        if (!result) { res.status(404).json({ success: false, message: "Category not found" }); return; }
        sendResponse(res, { statusCode: 200, success: true, message: `Category ${result.isActive ? "activated" : "deactivated"} successfully`, data: result });
    } catch (error) { next(error); }
};

/** PATCH /categories/reorder — Admin: Bulk reorder categories */
const reorderCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { orderedIds } = req.body;
        if (!Array.isArray(orderedIds)) {
            res.status(400).json({ success: false, message: "orderedIds must be an array" });
            return;
        }
        const result = await categoryService.reorderCategories(orderedIds);
        sendResponse(res, { statusCode: 200, success: true, message: "Categories reordered successfully", data: result });
    } catch (error) { next(error); }
};

/** DELETE /categories/:id — Admin: Delete a category */
const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await categoryService.deleteCategory(req.params.id as string);
        if (!result) { res.status(404).json({ success: false, message: "Category not found" }); return; }
        sendResponse(res, { statusCode: 200, success: true, message: "Category deleted successfully", data: result });
    } catch (error) { next(error); }
};

export const categoryController = {
    getActiveCategories,
    getAllCategories,
    getCategoryById,
    getCategoryBySlug,
    createCategory,
    updateCategory,
    toggleCategory,
    reorderCategories,
    deleteCategory,
};
