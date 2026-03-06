import { Router, Request, Response } from "express";
import { getActivities } from "../../finance/services/activity.service";
import { mapActivity, ActivityResponse } from "../mappers/activity.mapper";
import { requireAuth } from "../../auth/middleware/requireAuth";
import { requireRole } from "../../auth/middleware/requireRole";
import { toErrorResponse, ValidationError } from "../../shared/error";

import type { AuthenticatedRequest } from "../../auth/types";

// Mongoose Models
import { UserModel as User } from "../../identity/models/User.model";
import { Student } from "../../identity/models/Student.model";
import { ClassModel as Class } from "../../identity/models/Class.model";

const router = Router();

// ===========================================================================
// GET /api/system/activity
// Returns a paginated list of recent system activities from the audit log.
// Accessible ONLY to ADMIN role.
// ===========================================================================
router.get(
    "/",
    requireAuth as any,
    requireRole("ADMIN") as any,
    async (req: Request, res: Response) => {
        const authReq = req as AuthenticatedRequest;
        try {
            let limit = 20;
            let offset = 0;

            if (req.query.limit !== undefined) {
                const l = parseInt(String(req.query.limit), 10);
                if (Number.isNaN(l) || l < 1) {
                    throw new ValidationError("Query parameter 'limit' must be a positive integer");
                }
                limit = l;
            }

            if (req.query.offset !== undefined) {
                const o = parseInt(String(req.query.offset), 10);
                if (Number.isNaN(o) || o < 0) {
                    throw new ValidationError("Query parameter 'offset' must be a non-negative integer");
                }
                offset = o;
            }

            const rawActivities = await getActivities(limit, offset);

            const enrichedActivities: ActivityResponse[] = [];

            // Execute enrichment sequentially vs Promise.all directly on map loops
            // Optional data enrichment outside Postgres finance layer
            for (const activity of rawActivities) {
                const mapped = mapActivity(activity);

                try {
                    // Try to resolve the user who performed the action
                    if (activity.performedBy) {
                        const user = await User.findById(activity.performedBy).lean().exec();
                        if (user && user.name) {
                            mapped.performedByName = user.name;
                        }
                    }

                    // Try to resolve student identity if it is available in metadata
                    const studentId = activity.metadata?.studentId as string | undefined;
                    if (studentId) {
                        const student = await Student.findById(studentId).lean().exec();
                        if (student) {
                            mapped.studentName = `${student.firstName} ${student.lastName}`;

                            if (student.classID) {
                                const classDoc = await Class.findById(student.classID).lean().exec();
                                if (classDoc) {
                                    mapped.className = classDoc.ClassName;
                                }
                            }
                        }
                    }
                } catch (enrichmentError) {
                    // If enrichment fails (e.g invalid mongo id), we simply ignore it
                    // The endpoint must still return the base activity record.
                    console.error("[Enrichment Error] Failed to resolve details for activity:", activity.id, enrichmentError);
                }

                enrichedActivities.push(mapped);
            }

            res.json(enrichedActivities);
        } catch (err) {
            const { status, body } = toErrorResponse(err);
            res.status(status).json(body);
        }
    }
);

export default router;
