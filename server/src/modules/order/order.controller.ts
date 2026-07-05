import { NextFunction, Request, Response } from "express";
import { orderService } from "./order.service.js";
import sendResponse from "../../utils/sendResponse.js";

/** POST /orders — Place a new order (public) */
const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await orderService.createOrder(req.body);
        sendResponse(res, { statusCode: 201, success: true, message: "Order placed successfully", data: result });
    } catch (error) { next(error); }
};

/** GET /orders — Get paginated orders (admin) */
const getOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const result = await orderService.getOrders(page, limit);
        sendResponse(res, { statusCode: 200, success: true, message: "Orders fetched successfully", data: result });
    } catch (error) { next(error); }
};

/** GET /orders/stats — Aggregated dashboard stats (admin) */
const getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await orderService.getStats();
        sendResponse(res, { statusCode: 200, success: true, message: "Stats fetched successfully", data: result });
    } catch (error) { next(error); }
};

/** GET /orders/monthly — Monthly chart data (admin) */
const getMonthlyData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await orderService.getMonthlyData();
        sendResponse(res, { statusCode: 200, success: true, message: "Monthly data fetched", data: result });
    } catch (error) { next(error); }
};

/** PATCH /orders/:id/status — Update order status (admin) */
const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status } = req.body;
        const result = await orderService.updateOrderStatus(req.params.id as string, status);
        if (!result) { res.status(404).json({ success: false, message: "Order not found" }); return; }
        sendResponse(res, { statusCode: 200, success: true, message: "Order status updated", data: result });
    } catch (error) { next(error); }
};

/** DELETE /orders — Bulk delete orders (admin) */
const deleteOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { ids } = req.body as { ids: string[] };
        if (!ids?.length) { res.status(400).json({ success: false, message: "No order IDs provided" }); return; }
        const result = await orderService.deleteOrders(ids);
        sendResponse(res, { statusCode: 200, success: true, message: `${result.deletedCount} order(s) deleted`, data: result });
    } catch (error) { next(error); }
};

/** PATCH /orders/:id/reconcile — Mark COD order payment as completed (admin) */
const reconcilePayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await orderService.reconcilePayment(req.params.id as string);
        sendResponse(res, { statusCode: 200, success: true, message: "Payment reconciled successfully", data: result });
    } catch (error: any) {
        if (error.statusCode) {
            res.status(error.statusCode).json({ success: false, message: error.message });
            return;
        }
        next(error);
    }
};

export const orderController = {
    createOrder,
    getOrders,
    getStats,
    getMonthlyData,
    updateOrderStatus,
    deleteOrders,
    reconcilePayment,
};
