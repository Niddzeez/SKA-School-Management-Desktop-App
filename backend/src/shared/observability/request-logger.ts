import { Request, Response, NextFunction } from "express";
import { logger } from "./logger";

/**
 * Middleware that captures the duration and status code of incoming requests.
 * It hooks into the response "finish" event to log the final outcome.
 */
export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction) {
    const start = performance.now();

    res.on("finish", () => {
        const durationMs = Math.round(performance.now() - start);

        // Extract userId if the requireAuth middleware was applied
        let userId: string | undefined;
        if (req.user && req.user.id) {
            userId = req.user.id;
        }

        logger.info(`HTTP ${req.method} ${req.originalUrl}`, {
            requestId: req.id,
            method: req.method,
            route: req.originalUrl,
            statusCode: res.statusCode,
            durationMs,
            userId
        });
    });

    next();
}
