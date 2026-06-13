import { Router } from "express";
import { courierController } from "./courier.controller.js";
import { authenticate } from "../../middleware/authenticate.js";

const router = Router();

/** POST — Send selected orders to courier (admin only) */
router.post("/send", authenticate, courierController.sendToCourier);

export const courierRoute = router;
