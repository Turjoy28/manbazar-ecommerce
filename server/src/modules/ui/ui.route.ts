import { Router } from "express";
import { uiController } from "./ui.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();



router.get("/all-data", uiController.getUiData);


router.patch("/update-ui/:id", authenticate, authorize("ADMIN"), uiController.updateUiData);



export const uiRoute = router;