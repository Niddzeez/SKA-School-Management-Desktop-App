/**
 * Shared identity-lookup service for cross-subsystem name resolution.
 *
 * This module lives in src/shared/ (NOT src/finance/) so that finance
 * route handlers can enrich PostgreSQL data with identity names without
 * violating the hybrid database boundary.
 *
 * Finance services remain pure PostgreSQL — only route handlers call
 * these functions to compose final API responses.
 */

import { ClassModel } from "../identity/models/Class.model";
import { Student } from "../identity/models/Student.model";

// ---------------------------------------------------------------------------
// Class name lookups
// ---------------------------------------------------------------------------

export interface ClassInfo {
    id: string;
    className: string;
}

/**
 * Returns a map of classId → className for the given IDs.
 * Unknown IDs are silently omitted from the result.
 */
export async function getClassNameMap(
    classIds: string[]
): Promise<Map<string, string>> {
    if (classIds.length === 0) return new Map();

    const docs = await ClassModel.find(
        { _id: { $in: classIds } },
        { ClassName: 1 }
    ).lean();

    const map = new Map<string, string>();
    for (const doc of docs) {
        map.set(String(doc._id), doc.ClassName);
    }
    return map;
}

// ---------------------------------------------------------------------------
// Student basic info lookups
// ---------------------------------------------------------------------------

export interface StudentBasicInfo {
    id: string;
    firstName: string;
    lastName: string;
    classId: string | undefined;
}

/**
 * Returns a map of studentId → basic info for the given IDs.
 * Only fetches name and classID — not the full student document.
 */
export async function getStudentBasicInfoMap(
    studentIds: string[]
): Promise<Map<string, StudentBasicInfo>> {
    if (studentIds.length === 0) return new Map();

    const docs = await Student.find(
        { _id: { $in: studentIds } },
        { firstName: 1, lastName: 1, classID: 1 }
    ).lean();

    const map = new Map<string, StudentBasicInfo>();
    for (const doc of docs) {
        const id = String(doc._id);
        map.set(id, {
            id,
            firstName: doc.firstName,
            lastName: doc.lastName,
            classId: doc.classID ?? undefined,
        });
    }
    return map;
}
