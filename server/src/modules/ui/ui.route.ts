import { Router } from "express";
import { uiController } from "./ui.controller";

const router = Router();



router.get("/all-data", uiController.getUiData);


router.patch("/update-ui/:id", uiController.updateUiData);



export const uiRoute = router;