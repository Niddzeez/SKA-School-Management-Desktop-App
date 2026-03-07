import type { Response, NextFunction, RequestHandler } from "express";
import type { AuthenticatedRequest } from "../types";

/**
 * Express middleware factory that restricts access to users with
 * one of the specified roles.
 *
 * Must be used AFTER requireAuth (which populates req.user).
 *
 * Usage:
 *   router.post("/", requireAuth, requireRole("ADMIN"), handler);
 *   router.get("/",  requireAuth, requireRole("ADMIN", "TEACHER"), handler);
 */
export function requireRole(...roles: string[]): RequestHandler {
    return (req, res, next): void => {
        if (!req.user) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({ error: "Insufficient permissions" });
            return;
        }

        next();
    };
}
