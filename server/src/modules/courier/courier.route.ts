import { Router } from "express";
import { courierController } from "./courier.controller.js";
import { authenticate } from "../../middleware/authenticate.js";

import { pathaoWebhookController, steadfastWebhookController } from "./courier.webhook.controller.js";

const router = Router();

/** POST — Send selected orders to courier (admin only) */
router.post("/send", authenticate, courierController.sendToCourier);

/** POST — Pathao Webhook for real-time tracking updates */
router.post("/webhooks/pathao", pathaoWebhookController);

/** POST — Steadfast Webhook for real-time tracking updates */
router.post("/webhooks/steadfast", steadfastWebhookController);

export const courierRoute = router;
