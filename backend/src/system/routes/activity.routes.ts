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
    requireAuth,
    requireRole("ADMIN"),
    async (req: Request, res: Response) => {
        const authReq = req as AuthenticatedRequest;

        try {
            let limit = 20;
            let offset = 0;

            if (req.query.limit !== undefined) {
                const l = parseInt(String(req.query.limit), 10);
                if (Number.isNaN(l) || l < 1) {
                    throw new ValidationError(
                        "Query parameter 'limit' must be a positive integer"
                    );
                }
                limit = l;
            }

            if (req.query.offset !== undefined) {
                const o = parseInt(String(req.query.offset), 10);
                if (Number.isNaN(o) || o < 0) {
                    throw new ValidationError(
                        "Query parameter 'offset' must be a non-negative integer"
                    );
                }
                offset = o;
            }

            const rawActivities = await getActivities(limit, offset);

            // ----------------------------------------------------------
            // 1️⃣ Collect unique IDs for batching
            // ----------------------------------------------------------

            const userIds = new Set<string>();
            const studentIds = new Set<string>();

            for (const activity of rawActivities) {
                if (activity.performedBy) {
                    userIds.add(activity.performedBy);
                }

                const studentId = activity.metadata?.studentId as
                    | string
                    | undefined;

                if (studentId) {
                    studentIds.add(studentId);
                }
            }

            // ----------------------------------------------------------
            // 2️⃣ Batch Mongo queries
            // ----------------------------------------------------------

            const users = userIds.size
                ? await User.find({ _id: { $in: [...userIds] } })
                    .select("name")
                    .lean()
                    .exec()
                : [];

            const students = studentIds.size
                ? await Student.find({ _id: { $in: [...studentIds] } })
                    .select("firstName lastName classID")
                    .lean()
                    .exec()
                : [];

            // ----------------------------------------------------------
            // 3️⃣ Collect class IDs from students
            // ----------------------------------------------------------

            const classIds = new Set<string>();

            for (const s of students) {
                if (s.classID) {
                    classIds.add(String(s.classID));
                }
            }

            const classes = classIds.size
                ? await Class.find({ _id: { $in: [...classIds] } })
                    .select("ClassName")
                    .lean()
                    .exec()
                : [];

            // ----------------------------------------------------------
            // 4️⃣ Create lookup maps
            // ----------------------------------------------------------

            const userMap = new Map(
                users.map((u) => [String(u._id), u])
            );

            const studentMap = new Map(
                students.map((s) => [String(s._id), s])
            );

            const classMap = new Map(
                classes.map((c) => [String(c._id), c])
            );

            // ----------------------------------------------------------
            // 5️⃣ Enrich activities using lookup maps
            // ----------------------------------------------------------

            const enrichedActivities: ActivityResponse[] =
                rawActivities.map((activity) => {
                    const mapped = mapActivity(activity);

                    try {
                        // Resolve user
                        if (activity.performedBy) {
                            const user = userMap.get(activity.performedBy);
                            if (user?.name) {
                                mapped.performedByName = user.name;
                            }
                        }

                        // Resolve student
                        const studentId = activity.metadata?.studentId as
                            | string
                            | undefined;

                        if (studentId) {
                            const student = studentMap.get(studentId);

                            if (student) {
                                mapped.studentName = `${student.firstName} ${student.lastName}`;

                                if (student.classID) {
                                    const classDoc = classMap.get(
                                        String(student.classID)
                                    );

                                    if (classDoc) {
                                        mapped.className = classDoc.ClassName;
                                    }
                                }
                            }
                        }
                    } catch (enrichmentError) {
                        console.error(
                            "[Enrichment Error] Failed to resolve details for activity:",
                            activity.id,
                            enrichmentError
                        );
                    }

                    return mapped;
                });

            res.json(enrichedActivities);
        } catch (err) {
            const { status, body } = toErrorResponse(err);
            res.status(status).json(body);
        }
    }
);

export default router;