import { NextFunction, Request, Response } from "express";
import { authService } from "./auth.service.js";
import sendResponse from "../../utils/sendResponse.js";

/**
 * POST /api/v1/auth/login
 * Validates credentials, sets HTTP-only JWT cookie, returns admin info.
 */
const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ success: false, message: "Email and password are required" });
            return;
        }

        const { token, admin } = await authService.login(email, password);

        const isProduction = process.env.NODE_ENV === "production";
        // Set secure HTTP-only cookie
        res.cookie("adminToken", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            domain: isProduction ? ".manbazar.com" : undefined,
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Login successful",
            data: { admin, token },
        });
    } catch (error: unknown) {
        const err = error as Error;
        res.status(401).json({ success: false, message: err.message || "Login failed" });
    }
};

/**
 * POST /api/v1/auth/logout
 * Clears the JWT cookie.
 */
const logout = (req: Request, res: Response) => {
    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("adminToken", {
        domain: isProduction ? ".manbazar.com" : undefined,
        sameSite: isProduction ? "none" : "lax",
        secure: isProduction,
    });
    sendResponse(res, { statusCode: 200, success: true, message: "Logged out successfully" });
};

/**
 * GET /api/v1/auth/me
 * Returns current admin from token (set by authenticate middleware).
 */
const me = (req: Request, res: Response) => {
    const admin = (req as Request & { admin: unknown }).admin;
    sendResponse(res, { statusCode: 200, success: true, message: "Admin info", data: admin });
};

export const authController = { login, logout, me };
