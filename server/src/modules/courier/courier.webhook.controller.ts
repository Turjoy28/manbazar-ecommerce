import { Request, Response } from "express";
import config from "../../config/index.js";
import { Ui } from "../../models/ui.model.js";
import { courierWebhookService } from "./courier.webhook.service.js";

export const pathaoWebhookController = async (req: Request, res: Response): Promise<any> => {
    try {
        const payload = req.body;
        console.log(`[PATHAO WEBHOOK] Received:`, {
            event: payload.event,
            consignment_id: payload.consignment_id,
            merchant_order_id: payload.merchant_order_id,
            rider: payload.delivery_rider_name || payload.rider_name || payload.pickup_rider_name || "N/A",
        });

        await courierWebhookService.process({
            provider: "pathao",
            payload,
            headers: req.headers,
        });

        return res.status(200).json({ success: true });
    } catch (error: any) {
        console.error("Pathao Webhook Error:", error.message || error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

export const steadfastWebhookController = async (req: Request, res: Response): Promise<any> => {
    try {
        const authHeader = req.headers.authorization;
        const ui = await Ui.findOne();
        const configuredToken = config.steadfast_webhook_token || (ui?.courier?.steadfast as any)?.webhookToken;

        // If a secret token is configured in .env or settings, validate it
        if (configuredToken) {
            const expectedBearer = `Bearer ${configuredToken}`;
            const matchesBearer = authHeader === expectedBearer;
            const matchesDirect = authHeader === configuredToken || req.headers["api-key"] === configuredToken;

            if (!matchesBearer && !matchesDirect) {
                console.warn("[STEADFAST WEBHOOK] Unauthorized request received");
                return res.status(401).json({ message: "Unauthorized webhook" });
            }
        }

        console.log(`[STEADFAST WEBHOOK] Received:`, {
            status: req.body.status || req.body.delivery_status,
            consignment_id: req.body.consignment_id || req.body.tracking_code,
            invoice: req.body.invoice,
            rider: req.body.rider_name || req.body.delivery_man_name || "N/A",
        });

        await courierWebhookService.process({
            provider: "steadfast",
            payload: req.body,
            headers: req.headers,
        });

        return res.status(200).json({ success: true });
    } catch (error: any) {
        console.error("Steadfast Webhook Error:", error.message || error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

export const carrybeeWebhookController = async (req: Request, res: Response): Promise<any> => {
    const expectedSecret =
        process.env.CB_WEBHOOK_SECRET ||
        config.carrybee_webhook_secret ||
        "40489fe0-9386-4fc9-8e92-2b2fcb9d451c";

    // CarryBee requires X-CB-Webhook-Integration-Header in response
    res.setHeader("X-CB-Webhook-Integration-Header", expectedSecret);

    try {
        const incomingSecret =
            req.headers["x-cb-webhook-integration-header"] ||
            req.headers["x-cb-webhook-secret"] ||
            req.headers["x-webhook-secret"] ||
            (req.headers.authorization && req.headers.authorization.replace("Bearer ", ""));

        // Validate secret header if provided or enforced
        if (incomingSecret && incomingSecret !== expectedSecret) {
            console.warn("[CARRYBEE WEBHOOK] Unauthorized request: Invalid X-CB-Webhook-Integration-Header");
            return res.status(401).json({ success: false, message: "Unauthorized: Invalid X-CB-Webhook-Integration-Header" });
        }

        // Check if this is a validation ping / handshake request from CarryBee portal
        const isHandshake =
            req.method === "GET" ||
            req.method === "HEAD" ||
            !req.body ||
            Object.keys(req.body).length === 0 ||
            (!req.body.consignment_id && !req.body.data?.order?.consignment_id && !req.body.transfer_status_id && !req.body.data?.order?.transfer_status_id);

        if (isHandshake) {
            console.log("[CARRYBEE WEBHOOK] Handshake / Verification test ping verified successfully.");
            return res.status(202).json({
                success: true,
                message: "CarryBee Webhook Handshake verified successfully"
            });
        }

        console.log(`[CARRYBEE WEBHOOK] Received:`, {
            transfer_status_id: req.body.transfer_status_id || req.body.data?.order?.transfer_status_id,
            status: req.body.status,
            consignment_id: req.body.consignment_id || req.body.data?.order?.consignment_id,
            rider: req.body.rider_name || req.body.data?.order?.rider_name || "N/A",
        });

        try {
            await courierWebhookService.process({
                provider: "carrybee",
                payload: req.body,
                headers: req.headers,
            });
        } catch (procErr: any) {
            console.warn(`[CARRYBEE WEBHOOK] Order processing notice: ${procErr.message}`);
        }

        // CarryBee explicitly expects HTTP 202 Accepted
        return res.status(202).json({ success: true, message: "Webhook accepted and processed" });
    } catch (error: any) {
        console.error("CarryBee Webhook Error:", error.message || error);
        return res.status(202).json({ success: false, error: error.message });
    }
};
