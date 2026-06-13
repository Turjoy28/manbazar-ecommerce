import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../config/index.js";

/**
 * Middleware to authenticate admin routes via JWT.
 * Reads token from Authorization header (Bearer) or cookie.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        // Try cookie first, then Authorization header
        const token = req.cookies?.adminToken || (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : null);


        if (!token) {
            res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
            return;
        }

        const secret = config.jwt_secret || config.secret;
        const decoded = jwt.verify(token, secret) as { id: string; email: string; role: string };

        // Attach admin info to request
        (req as Request & { admin: typeof decoded }).admin = decoded;
        next();
    } catch {
        res.status(401).json({ success: false, message: "Unauthorized: Invalid or expired token" });
    }
};
