import { Router, Request, Response } from "express";
import { getDashboardBootstrap } from "../../dashboard/services/bootstrap.service";
import { toErrorResponse } from "../../shared/error";

const router = Router();

router.get("/", async (req: Request, res: Response) => {

    try {

        const sessionId = req.query.year as string;

        if (!sessionId) {
            return res.status(400).json({
                message: "year query parameter required"
            });
        }

        const data = await getDashboardBootstrap(sessionId);

        res.json(data);

    } catch (err) {

        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);

    }

});

export default router;