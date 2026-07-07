import { Request, Response, NextFunction } from "express";

/**
 * Middleware to authorize specific roles.
 * Must be used after the authenticate middleware.
 */
export const authorize = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).admin;
        if (!user || !allowedRoles.includes(user.role)) {
            res.status(403).json({
                success: false,
                message: "Forbidden: You do not have permission to perform this action",
            });
            return;
        }
        next();
    };
};
