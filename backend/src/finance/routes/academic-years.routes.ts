import { Router, Request, Response } from "express";
import {
    getAllSessions,
} from "../services/ledger.service";
import { mapAcademicSession } from "../mappers/academic-session.mapper";
import { toErrorResponse } from "../../shared/error";
import { requireRole } from "../../auth/middleware/requireRole";
import { ValidationError, NotFoundError, ConflictError } from "../../shared/error";
import { getPool } from "../../config/postgres";
import { isUUID } from "../../shared/validators";
import { ClassModel } from "../../identity/models/Class.model";
import { Student } from "../../identity/models/Student.model";
import { feeStructureService } from "../services/feeStructure.service";
import { createLedgerIfEligible } from "../services/ledger.service";

/**
 * Canonical class ordering — must match seedClasses.ts.
 * This determines the promotion sequence for every student.
 * The last entry (Class 12) has no next class → students become Alumni.
 */
const CLASS_ORDER: string[] = [
    "Playgroup", "Nursery", "LKG", "UKG",
    "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12",
];

const router = Router();


// ---------------------------------------------------------------------------
// GET /api/academic-years
// Returns all academic sessions ordered most-recent first.
// Response shape matches frontend AcademicYearMeta.
// ---------------------------------------------------------------------------
router.get("/", async (_req: Request, res: Response) => {
    try {
        const rows = await getAllSessions();
        res.json(rows.map(mapAcademicSession));
    } catch (err) {
        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);
    }
});

// ---------------------------------------------------------------------------
// POST /api/academic-years
// Create a new academic session from scratch
// ---------------------------------------------------------------------------
router.post("/", requireRole("ADMIN"), async (req: Request, res: Response) => {
    try {
        const { name, startDate, endDate } = req.body;

        if (!name || !startDate || !endDate) {
            return res.status(400).json({ error: "name, startDate and endDate are required" });
        }

        const pool = getPool();
        const { rows } = await pool.query(
            `INSERT INTO academic_sessions
                (id, name, start_date, end_date, is_closed, is_promotion_locked)
             VALUES (gen_random_uuid(), $1, $2, $3, false, false)
             RETURNING *`,
            [name, startDate, endDate]
        );

        res.status(201).json(rows[0]);
    } catch (err: any) {
        if (err.code === "23505") {
            return res.status(409).json({ error: `Academic year '${req.body.name}' already exists` });
        }
        res.status(500).json({ error: "Failed to create academic session" });
    }
});

router.post("/:id/close", requireRole("ADMIN"), async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id);

        if (!isUUID(id)) {
            throw new ValidationError("'id' must be a valid academic session UUID");
        }

        const pool = getPool();

        const { rowCount } = await pool.query(
            `
            UPDATE academic_sessions
            SET is_closed = TRUE,
                closed_at = NOW()
            WHERE id = $1
            `,
            [id]
        );

        if (rowCount === 0) {
            throw new NotFoundError("Academic session", id);
        }

        res.status(204).send();
    } catch (err) {
        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);
    }
});


/* =========================
   Pending Balance Summary
========================= */

router.get("/:id/pending-summary", async (req, res) => {
    try {
        const { id } = req.params;
        const pool = getPool();
        const result = await pool.query(
            `
      SELECT COUNT(*)::int AS pending_count
      FROM ledger_summary ls
      JOIN student_fee_ledgers l
        ON l.id = ls.ledger_id
      WHERE l.academic_session_id = $1
      AND (ls.base_total + ls.adjustments_total - ls.paid_total) > 0
      `,
            [id]
        );

        return res.json({
            pendingCount: result.rows[0].pending_count,
        });
    } catch (err) {
        console.error("Failed to compute pending balances:", err);
        res.status(500).json({
            message: "Failed to compute pending balances",
        });
    }
});

// ---------------------------------------------------------------------------
// GET /api/academic-years/:id/promotion-readiness
//
// Checks if the specified academic session is ready for promotion:
// // 1. Validates session ID.
// 2. Fetches the next academic session (must exist).
// 3. Validates that all classes in the next session have ACTIVE fee structures.
// ---------------------------------------------------------------------------
router.get("/:id/promotion-readiness", async (req, res) => {
  const id = req.params.id;
  const pool = getPool();

  const { rows } = await pool.query(`
    SELECT id, start_date FROM academic_sessions WHERE id = $1
  `, [id]);

  if (rows.length === 0) {
    return res.status(404).json({ error: "Session not found" });
  }

  const current = rows[0];

  const { rows: nextRows } = await pool.query(`
    SELECT id FROM academic_sessions
    WHERE start_date > $1
    ORDER BY start_date ASC
    LIMIT 1
  `, [current.start_date]);

  if (nextRows.length === 0) {
    return res.json({ ready: false, reason: "NO_NEXT_YEAR" });
  }

  const nextId = nextRows[0].id;

  const feeStructures = await feeStructureService.getAll(nextId);

  const activeClasses = feeStructures
    .filter(fs => fs.status === "ACTIVE")
    .map(fs => fs.classId);

  return res.json({
    ready: activeClasses.length > 0,
    nextAcademicSessionId: nextId
  });
});

// ---------------------------------------------------------------------------
// POST /api/academic-years/:id/run-promotion
//
// Runs the end-of-year promotion process for the specified academic session:
// 1. Validates the session ID and checks promotion lock.
// 2. Fetches the next academic session (must exist).
// 3. Builds a mapping of current class → next class (Class 10 → Alumni).
// 4. Validates that all next classes have ACTIVE fee structures.
// 5. Fetches all active students in the current session.
// 6. Updates each student's classID (or status to Alumni if graduating).
// 7. Creates new ledgers for promoted students in the next session.
// 8. Locks promotion for the current session to prevent re-runs.
// ---------------------------------------------------------------------------
//---------------------------------------------------------------------------
router.post("/:id/run-promotion", requireRole("ADMIN"), async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id);

        // ── 1. Validate UUID ────────────────────────────────────────────────
        if (!isUUID(id)) {
            throw new ValidationError("'id' must be a valid academic session UUID");
        }

        const pool = getPool();

        // ── 2. Fetch current session ─────────────────────────────────────────
        const { rows: sessions } = await pool.query<{
            id: string;
            is_promotion_locked: boolean;
            is_closed: boolean;
            start_date: string;
        }>(
            `SELECT id, is_promotion_locked, is_closed, start_date 
             FROM academic_sessions WHERE id = $1`,
            [id]
        );

        if (sessions.length === 0) {
            throw new NotFoundError("Academic session", id);
        }

        const currentSession = sessions[0];

        if (currentSession.is_promotion_locked) {
            throw new ConflictError("Promotion has already been run for this academic session");
        }

        if (currentSession.is_closed) {
            throw new ValidationError("Cannot run promotion on a closed academic year");
        }

        // ── 3. Fetch NEXT academic year ──────────────────────────────────────
        const { rows: nextYearRows } = await pool.query<{ id: string }>(
            `
            SELECT id
            FROM academic_sessions
            WHERE start_date > $1
            ORDER BY start_date ASC
            LIMIT 1
            `,
            [currentSession.start_date]
        );

        if (nextYearRows.length === 0) {
            throw new ValidationError(
                "Next academic year not found. Create it before running promotion."
            );
        }

        const nextAcademicSessionId = nextYearRows[0].id;

        // ── 4. Fetch classes (Mongo) ────────────────────────────────────────
        const classDocuments = await ClassModel.find().lean();

        const classNameToId = new Map<string, string>();
        for (const cls of classDocuments) {
            classNameToId.set(cls.ClassName, String(cls._id));
        }

        const class10Id = classNameToId.get("10");

        const nextClassIdMap = new Map<string, string | null>();
        for (let i = 0; i < CLASS_ORDER.length; i++) {
            const currentName = CLASS_ORDER[i];
            const nextName = CLASS_ORDER[i + 1] ?? null;

            const currentId = classNameToId.get(currentName);
            if (!currentId) continue;

            const nextId = nextName ? (classNameToId.get(nextName) ?? null) : null;
            nextClassIdMap.set(currentId, nextId);
        }

        // ── 5. Fetch ACTIVE fee structures for NEXT year ────────────────────
        const feeStructures = await feeStructureService.getAll(nextAcademicSessionId);

        const feeStructureMap = new Map<string, any[]>();
        for (const fs of feeStructures) {
            if (fs.status === "ACTIVE") {
                feeStructureMap.set(fs.classId, fs.components);
            }
        }

        // ── 6. VALIDATION: Ensure ALL classes have fee structure ────────────
        const missingClasses: string[] = [];

        for (const [_, nextClassId] of nextClassIdMap.entries()) {
            if (!nextClassId) continue;

            if (!feeStructureMap.has(nextClassId)) {
                missingClasses.push(nextClassId);
            }
        }

        if (missingClasses.length > 0) {
            throw new ValidationError(
                `Cannot run promotion. Missing ACTIVE fee structures for ${missingClasses.length} classes`
            );
        }

        // ── 7. Fetch active students ────────────────────────────────────────
        const activeStudents = await Student.find({
            status: { $in: ["Active", "ACTIVE"] },
            classID: { $exists: true, $ne: null },
        })
            .select("_id classID")
            .lean();

        if (activeStudents.length === 0) {
            await pool.query(
                `UPDATE academic_sessions SET is_promotion_locked = TRUE WHERE id = $1`,
                [id]
            );
            return res.json({ success: true, promotedCount: 0, graduatedCount: 0 });
        }

        // ── 8. Build operations ─────────────────────────────────────────────
        let promotedCount = 0;
        let graduatedCount = 0;

        const bulkOps: Parameters<typeof Student.bulkWrite>[0] = [];
        const promotedStudents: { studentId: string; classId: string }[] = [];

        for (const student of activeStudents) {
            const currentClassId = String(student.classID);
            const nextClassId = nextClassIdMap.get(currentClassId);

            if (nextClassId === undefined) continue;

            // Class 10 → Alumni
            if (currentClassId === class10Id) {
                bulkOps.push({
                    updateOne: {
                        filter: { _id: student._id },
                        update: {
                            $set: {
                                status: "Alumni",
                                classID: null,
                                sectionID: null,
                            },
                        },
                    },
                });
                graduatedCount++;
            }

            // Normal promotion
            else if (nextClassId !== null) {
                bulkOps.push({
                    updateOne: {
                        filter: { _id: student._id },
                        update: {
                            $set: {
                                classID: nextClassId,
                            },
                        },
                    },
                });

                promotedStudents.push({
                    studentId: String(student._id),
                    classId: nextClassId,
                });

                promotedCount++;
            }
        }

        // ── 9. Execute promotion ────────────────────────────────────────────
        if (bulkOps.length > 0) {
            await Student.bulkWrite(bulkOps, { ordered: false });
        }

        // ── 10. Ledger creation (NEXT YEAR) ─────────────────────────────────
        for (const student of promotedStudents) {
            const baseComponents = feeStructureMap.get(student.classId);

            if (!baseComponents || baseComponents.length === 0) continue;

            await createLedgerIfEligible({
                studentId: student.studentId,
                classId: student.classId,
                academicSessionId: nextAcademicSessionId, // 🔥 FIXED
                baseComponents,
            });
        }

        // ── 11. Lock promotion ──────────────────────────────────────────────
        await pool.query(
            `UPDATE academic_sessions SET is_promotion_locked = TRUE WHERE id = $1`,
            [id]
        );

        // ── 12. Response ────────────────────────────────────────────────────
        res.json({
            success: true,
            promotedCount,
            graduatedCount,
            nextAcademicSessionId,
        });

    } catch (err) {
        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);
    }
});

export default router;

