import mongoose, { Types } from "mongoose";
import { getPool } from "../../config/postgres";

export interface ActivityItem {
    id: string;
    type: string;
    user_id?: string;
    student_id?: string;
    class_id?: string;
    created_at: string;

    user?: any;
    student?: any;
    class?: any;
}

export async function getActivityFeed(
    page: number,
    pageSize: number
): Promise<ActivityItem[]> {

    const pool = getPool();

    const offset = (page - 1) * pageSize;

    /* -------------------------
       1️⃣ Fetch activity records
    ------------------------- */

    const { rows } = await pool.query<ActivityItem>(
        `SELECT *
     FROM activity_feed
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
        [pageSize, offset]
    );

    const activities = rows;

    if (activities.length === 0) {
        return [];
    }

    /* -------------------------
       2️⃣ Collect unique IDs
    ------------------------- */

    const userIds = new Set<string>();
    const studentIds = new Set<string>();
    const classIds = new Set<string>();

    for (const act of activities) {
        if (act.user_id) userIds.add(act.user_id);
        if (act.student_id) studentIds.add(act.student_id);
        if (act.class_id) classIds.add(act.class_id);
    }

    /* -------------------------
       3️⃣ Mongo connection
    ------------------------- */

    const db = mongoose.connection.db;
    if (!db) throw new Error("MongoDB connection not initialized");

    /* -------------------------
       4️⃣ Batched Mongo queries
    ------------------------- */

    const [users, students, classes] = await Promise.all([
        userIds.size === 0
            ? []
            : db.collection("users")
                .find({
                    _id: {
                        $in: [...userIds].map(id => new Types.ObjectId(id))
                    }
                })
                .toArray(),

        studentIds.size === 0
            ? []
            : db.collection("students")
                .find({
                    _id: {
                        $in: [...studentIds].map(id => new Types.ObjectId(id))
                    }
                })
                .toArray(),

        classIds.size === 0
            ? []
            : db.collection("classes")
                .find({
                    _id: {
                        $in: [...classIds].map(id => new Types.ObjectId(id))
                    }
                })
                .toArray()
    ]);

    /* -------------------------
       5️⃣ Build lookup maps
    ------------------------- */

    const userMap = new Map(
        users.map((u: any) => [u._id.toString(), u])
    );

    const studentMap = new Map(
        students.map((s: any) => [s._id.toString(), s])
    );

    const classMap = new Map(
        classes.map((c: any) => [c._id.toString(), c])
    );

    /* -------------------------
       6️⃣ Enrich activity items
    ------------------------- */

    const enriched = activities.map(act => ({
        ...act,
        user: act.user_id ? userMap.get(act.user_id) ?? null : null,
        student: act.student_id
            ? studentMap.get(act.student_id) ?? null
            : null,
        class: act.class_id
            ? classMap.get(act.class_id) ?? null
            : null
    }));

    return enriched;
}