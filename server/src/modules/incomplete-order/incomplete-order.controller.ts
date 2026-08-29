import { NextFunction, Request, Response } from "express";
import { incompleteOrderService } from "./incomplete-order.service.js";
import sendResponse from "../../utils/sendResponse.js";

/** POST /incomplete-orders — Upsert an incomplete order (public) */
const upsertIncompleteOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { sessionId, ...data } = req.body;
        if (!sessionId) {
            res.status(400).json({ success: false, message: "sessionId is required" });
            return;
        }
        const result = await incompleteOrderService.upsertIncompleteOrder(sessionId, data);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Incomplete order saved",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/** GET /incomplete-orders — Get paginated incomplete orders (admin) */
const getIncompleteOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const result = await incompleteOrderService.getIncompleteOrders(page, limit);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Incomplete orders fetched successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/** DELETE /incomplete-orders — Bulk delete incomplete orders (admin) */
const deleteIncompleteOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { ids } = req.body as { ids: string[] };
        if (!ids?.length) {
            res.status(400).json({ success: false, message: "No order IDs provided" });
            return;
        }
        const result = await incompleteOrderService.deleteIncompleteOrders(ids);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: `${result.deletedCount} incomplete order(s) deleted`,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/** DELETE /incomplete-orders/:id — Delete a single incomplete order (admin) */
const deleteIncompleteOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await incompleteOrderService.deleteIncompleteOrder(req.params.id as string);
        if (!result) {
            res.status(404).json({ success: false, message: "Incomplete order not found" });
            return;
        }
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Incomplete order deleted",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const incompleteOrderController = {
    upsertIncompleteOrder,
    getIncompleteOrders,
    deleteIncompleteOrders,
    deleteIncompleteOrder,
};
