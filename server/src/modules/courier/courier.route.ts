import { Router } from "express";
import { courierController } from "./courier.controller.js";
import { authenticate } from "../../middleware/authenticate.js";

import { pathaoWebhookController, steadfastWebhookController, carrybeeWebhookController } from "./courier.webhook.controller.js";

const router = Router();

/** POST — Send selected orders to courier (admin only) */
router.post("/send", authenticate, courierController.sendToCourier);

/** POST — Pathao Webhook for real-time tracking updates */
router.post("/webhooks/pathao", pathaoWebhookController);

/** POST — Steadfast Webhook for real-time tracking updates */
router.post("/webhooks/steadfast", steadfastWebhookController);

/** POST — CarryBee Webhook for real-time tracking updates */
router.post("/webhooks/carrybee", carrybeeWebhookController);
router.post("/webhooks/cashback", carrybeeWebhookController);
router.post("/webhook/cashback", carrybeeWebhookController);

export const courierRoute = router;
