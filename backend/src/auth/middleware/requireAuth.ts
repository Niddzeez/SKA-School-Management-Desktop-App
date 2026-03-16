import type { Request, Response, NextFunction } from "express";
import { isTokenBlacklisted } from "../../config/tokenBlacklist";
import { verifyToken } from "../services/auth.service";
import type { AuthUserPayload } from "../types";

/**
 * Express middleware that verifies the JWT Bearer token from the
 * Authorization header and attaches `req.user` with { userId, name, role }.
 *
 * Returns 401 if the token is missing or invalid.
 */
export function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        res.status(401).json({ error: "Authentication required" });
        return undefined;
    }

    const token = header.slice(7); // Remove "Bearer "

    try {
        const payload = verifyToken(token) as AuthUserPayload & { jti?: string };
        if (payload.jti && isTokenBlacklisted(payload.jti)) {
            res.status(401).json({ error: "Token has been revoked" });
            return undefined;
        }
        req.user = payload;
        next();
    } catch {
        res.status(401).json({ error: "Invalid or expired token" });
    }
}
