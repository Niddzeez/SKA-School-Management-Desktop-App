import type { Response, NextFunction } from "express";
import { verifyToken } from "../services/auth.service";
import type { AuthenticatedRequest } from "../types";

/**
 * Express middleware that verifies the JWT Bearer token from the
 * Authorization header and attaches `req.user` with { userId, role }.
 *
 * Returns 401 if the token is missing or invalid.
 */
export function requireAuth(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        res.status(401).json({ error: "Authentication required" });
        return;
    }

    const token = header.slice(7); // Remove "Bearer "

    try {
        const payload = verifyToken(token);
        req.user = payload;
        next();
    } catch {
        res.status(401).json({ error: "Invalid or expired token" });
    }
}
