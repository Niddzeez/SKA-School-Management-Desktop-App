import { Router, Request, Response } from "express";
import { getPool } from "../../config/postgres";
import mongoose from "mongoose";
import { logger } from "../../shared/observability/logger";

const router = Router();

/**
 * GET /health
 * 
 * Verifies that the Express server is running and both PostgreSQL
 * and MongoDB connections are healthy. Exposes basic uptime.
 */
router.get("/", async (req: Request, res: Response) => {
    let pgStatus = "down";
    let mongoStatus = "down";
    let isHealthy = false;

    // 1. Check PostgreSQL
    try {
        const { rows } = await getPool().query("SELECT 1 as ok");
        if (rows[0]?.ok === 1) {
            pgStatus = "up";
        }
    } catch (err) {
        logger.error("Health check failed for PostgreSQL", err instanceof Error ? err : undefined, { requestId: req.id });
    }

    // 2. Check MongoDB
    try {
        const state = mongoose.connection.readyState;
        // 1 = connected
        if (state === 1) {
            mongoStatus = "up";
        }
    } catch (err) {
        logger.error("Health check failed for MongoDB", err instanceof Error ? err : undefined, { requestId: req.id });
    }

    isHealthy = pgStatus === "up" && mongoStatus === "up";

    const response = {
        status: isHealthy ? "ok" : "degraded",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
            database: {
                postgres: pgStatus,
                mongodb: mongoStatus
            }
        }
    };

    res.status(isHealthy ? 200 : 503).json(response);
});

export default router;
