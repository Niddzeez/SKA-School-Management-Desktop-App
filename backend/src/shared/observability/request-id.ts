import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

/** Extend Express Request to include a requestId */
declare module "express-serve-static-core" {
    interface Request {
        id: string;
    }
}

/**
 * Middleware that assigns a unique UUID to every incoming API request.
 * It also attaches the `X-Request-ID` header to the response, allowing
 * clients to trace API calls.
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
    req.id = req.headers["x-request-id"] as string || crypto.randomUUID();
    res.setHeader("X-Request-ID", req.id);
    next();
}
