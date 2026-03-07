import type { Request } from "express";

/**
 * JWT payload embedded in every signed token.
 */
export interface JwtPayload {
    userId: string;
    role: "ADMIN" | "TEACHER";
}

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

/**
 * Express Request extended with the authenticated user.
 * Populated by the requireAuth middleware.
 */
export interface AuthenticatedRequest extends Request {
    user: JwtPayload;
}
