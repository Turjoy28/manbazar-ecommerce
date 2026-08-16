import { NextFunction, Request, Response } from "express";
import { sendOrdersToCourier, CourierName } from "./courier.service.js";
import sendResponse from "../../utils/sendResponse.js";

/**
 * POST /api/v1/courier/send
 * Body: { orderIds: string[], courier: "steadfast" | "pathao" | "redx" | "carrybee" }
 */
const sendToCourier = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { orderIds, courier } = req.body as { orderIds: string[]; courier: CourierName };

        if (!orderIds?.length) {
            res.status(400).json({ success: false, message: "No order IDs provided" });
            return;
        }

        if (!["steadfast", "pathao", "redx", "carrybee"].includes(courier)) {
            res.status(400).json({ success: false, message: "Invalid courier. Use: steadfast, pathao, redx, or carrybee" });
            return;
        }

        const results = await sendOrdersToCourier(orderIds, courier);
        if (results) {
            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: `Orders dispatched to ${courier}`,
                data: results,
            });
        }
    } catch (error) { next(error); }
};

export const courierController = { sendToCourier };
