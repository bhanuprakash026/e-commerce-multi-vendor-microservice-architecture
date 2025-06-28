import { NextFunction, Request, Response } from "express";
import { AuthError } from "../error-handler";

// Extend Express Request interface to include 'role'
declare global {
    namespace Express {
        interface Request {
            role?: string;
        }
    }
}

export const isSeller = (req: Request, res: Response, next: NextFunction) => {
    if (req.role !== "seller") {
        return next(new AuthError("Access denied. Seller only."));
    }
    next();
};

export const isUser = (req: Request, res: Response, next: NextFunction) => {
    if (req.role !== "user") {
        return next(new AuthError("Access denied. Seller only."));
    }
    next();
};
