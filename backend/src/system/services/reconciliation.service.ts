import mongoose, { Types } from "mongoose";
import { getPool } from "../../config/postgres";

export async function runReconciliation() {

    /* 1️⃣ Fetch all student IDs from PostgreSQL ledgers */

    const { rows } = await getPool().query(
        `SELECT DISTINCT student_id FROM student_fee_ledgers`
    );

    const ledgerStudentIds: string[] = rows.map(r => r.student_id);

    if (ledgerStudentIds.length === 0) {
        return {
            totalLedgers: 0,
            reconciledCount: 0,
            orphanedCount: 0,
            orphanedStudentIds: []
        };
    }

    /* 2️⃣ Convert valid IDs → ObjectIds */

    const objectIds = ledgerStudentIds
        .filter(id => Types.ObjectId.isValid(id))
        .map(id => new Types.ObjectId(id));

    const db = mongoose.connection.db;

    if (!db) {
        throw new Error("MongoDB connection not initialized");
    }

    /* 3️⃣ Fetch all matching Mongo students in ONE query */

    const students = await db.collection("students")
        .find({ _id: { $in: objectIds } })
        .project({ _id: 1 })
        .toArray();

    const mongoIds = new Set(
        students.map(s => s._id.toString())
    );

    /* 4️⃣ Identify orphaned ledgers */

    const orphanedStudentIds = ledgerStudentIds.filter(
        id => !mongoIds.has(id)
    );

    return {
        totalLedgers: ledgerStudentIds.length,
        reconciledCount: ledgerStudentIds.length - orphanedStudentIds.length,
        orphanedCount: orphanedStudentIds.length,
        orphanedStudentIds
    };
}