import { NextFunction, Request, Response } from "express";
import { bannersService } from "./banners.service.js";
import sendResponse from "../../utils/sendResponse.js";

const createBanner = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { imageUrl, destinationUrl } = req.body;
        if (!imageUrl) {
            res.status(400).json({ success: false, message: "Banner image URL is required" });
            return;
        }

        const result = await bannersService.createBanner({ imageUrl, destinationUrl });
        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "Promotional banner created successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getAllBanners = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await bannersService.getAllBanners();
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Promotional banners fetched successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const deleteBanner = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const result = await bannersService.deleteBanner(id as string);
        if (!result) {
            res.status(404).json({ success: false, message: "Banner not found" });
            return;
        }
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Promotional banner deleted successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const updateBanner = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const result = await bannersService.updateBanner(id as string, req.body);
        if (!result) {
            res.status(404).json({ success: false, message: "Banner not found" });
            return;
        }
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Promotional banner updated successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const bannersController = {
    createBanner,
    getAllBanners,
    deleteBanner,
    updateBanner,
};
