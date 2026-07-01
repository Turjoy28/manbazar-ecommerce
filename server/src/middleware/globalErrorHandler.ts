import { NextFunction, Request, Response } from "express";

interface ErrorResponse {
    success: boolean;
    message: string;
    error?: any;
}

export function errorHandler(error: any, req: Request, res: Response, next: NextFunction) {
    let statusCode = 500;
    let message = "Internal server error!!";
    let errorDetails = error;

    // Mongoose Validation Error
    if (error.name === "ValidationError") {
        statusCode = 400;
        message = "Validation error";
        errorDetails = Object.values(error.errors).map((err: any) => ({
            field: err.path,
            message: err.message,
        }));
    }

    // Mongoose Cast Error (Invalid ObjectId)
    else if (error.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${error.path}: ${error.value}`;
        errorDetails = {
            field: error.path,
            value: error.value,
        };
    }

    // Mongoose Duplicate Key Error
    else if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        statusCode = 409;
        message = `${field} already exists. Please use a different ${field}`;
        errorDetails = {
            field,
            value: error.keyValue[field],
        };
    }

    // Mongoose Model Not Found
    else if (error.name === "MongoServerError" && error.code === 121) {
        statusCode = 400;
        message = "Documant validation failed against schema";
        errorDetails = error.errmsg;
    }

    // Mongoose Connection Error
    else if (error.name === "MongoNetworkError" || error.name === "MongoTimeoutError") {
        statusCode = 503;
        message = "Database connection error. Please try again later";
        errorDetails = {
            originalError: error.message,
        };
    }

    // JWT Errors
    else if (error.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
        errorDetails = { originalError: error.message };
    }

    else if (error.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token has expired";
        errorDetails = { originalError: error.message };
    }

    // Custom status code if provided
    else if (error.status || error.statusCode) {
        statusCode = Number(error.status || error.statusCode);
        message = error.message || "An error occurred";
    }

    const response: ErrorResponse = {
        success: false,
        message,
        ...(process.env.NODE_ENV === "developmant" && { error: errorDetails }),
    };

    res.status(statusCode).json(response);
}