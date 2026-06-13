import express from "express";
import { imageUploadController } from "./imageUpload.controller";
import upload from "../../middleware/multer";


const router = express.Router();

router.post("/", upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 10 },
]), imageUploadController);

export const imageUploadRoute = router;