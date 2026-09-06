import { Request, Response } from "express";
import config from "../../config/index.js";
import { courierWebhookService } from "./courier.webhook.service";

export const pathaoWebhookController = async (req: Request, res: Response): Promise<any> => {
    try {
        const payload = req.body;
        // Verify pathao webhook signature (if applicable)
        const secretHeader = req.headers["x-pathao-signature"]; // Example header
        
        console.log("PATHAO WEBHOOK:", payload);
        await courierWebhookService.process({
            provider: "pathao",
            payload,
            headers: req.headers,
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Pathao Webhook Error:", error);
        return res.status(500).json({ success: false });
    }
};

export const steadfastWebhookController = async (req: Request, res: Response): Promise<any> => {
    try {
        const authHeader = req.headers.authorization;
        const expectedToken = `Bearer ${config.steadfast_webhook_token}`;
        
        if (authHeader !== expectedToken) {
            return res.status(401).json({ message: "Unauthorized webhook" });
        }

        await courierWebhookService.process({
            provider: "steadfast",
            payload: req.body,
            headers: req.headers,
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Steadfast Webhook Error:", error);
        return res.status(500).json({ success: false });
    }
};
