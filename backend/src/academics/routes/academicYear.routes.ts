import { Router, Request, Response } from "express";
import { getSessionStates } from "../services/academicYear.service";
import { requireAuth} from "../../auth/middleware/requireAuth";
import { getPool } from "../../config/postgres";

const router = Router();

router.get("/state", requireAuth, async (_req: Request, res: Response) => {
    const result = await getSessionStates();
    res.json(result);
});


//a route that gives the current active academic year
router.get("/current", requireAuth, async (_req: Request, res: Response) => {
    const pool = getPool();

    const { rows } = await pool.query(`
    SELECT *
    FROM academic_sessions
    WHERE is_closed = false
    ORDER BY start_date DESC
    LIMIT 1
  `);

    if (rows.length === 0) {
        return res.status(404).json({ error: "No active academic year found" });
    }

    res.json(rows[0]);
});


router.post("/create-next", requireAuth, async (_req: Request, res: Response) => {
    const pool = getPool();

    const { rows } = await pool.query(`
    SELECT *
    FROM academic_sessions
    ORDER BY start_date DESC
    LIMIT 1
  `);

    if (rows.length === 0) {
        return res.status(400).json({ error: "No existing academic year found" });
    }

    const latest = rows[0];

    const start = new Date(latest.start_date);
    const end = new Date(latest.end_date);

    const nextStart = new Date(start);
    nextStart.setFullYear(start.getFullYear() + 1);

    const nextEnd = new Date(end);
    nextEnd.setFullYear(end.getFullYear() + 1);

    const name = `${nextStart.getFullYear()}-${nextEnd.getFullYear()}`;

    const { rows: created } = await pool.query(
        `
    INSERT INTO academic_sessions
    (id, name, start_date, end_date, is_closed, is_promotion_locked)
    VALUES (gen_random_uuid(), $1, $2, $3, false, false)
    RETURNING *
    `,
        [name, nextStart, nextEnd]
    );

    res.status(201).json(created[0]);
});

export default router;