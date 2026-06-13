import { NextFunction, Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { imageUploadService } from "./imageUpload.service";

export const imageUploadController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const files = req.files as {
            [fieldname: string]: Express.Multer.File[];
        };

        const thumbnail = files?.thumbnail?.[0];
        const images = files?.images || [];

        if (!thumbnail && images.length === 0) {
            return res.status(400).json({
                message: "Please upload at least one image or thumbnail",
            });
        }

        const result = await imageUploadService(thumbnail, images);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Upload successful",
            data: result
        })
    } catch (error) {
        next(error);
    }
};