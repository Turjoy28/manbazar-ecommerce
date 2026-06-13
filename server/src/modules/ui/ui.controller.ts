import { NextFunction, Request, Response } from "express";
import { uiService } from "./ui.service";
import sendResponse from "../../utils/sendResponse";

const getUiData = async(req: Request, res: Response, next: NextFunction)=>{
    try {
        const result = await uiService.getUiData();
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Ui data fetched successfully",
            data: result
        })
    } catch (error) {
        next(error)
    }
}



const updateUiData = async(req: Request, res: Response, next: NextFunction)=>{
    try {
        const {id} = req.params;
        const result = await uiService.updateUiData(id as string, req.body);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Ui data updated successfully",
            data: result
        })
    } catch (error) {
        next(error)
    }
}



export const uiController = {
    getUiData,
    updateUiData
}