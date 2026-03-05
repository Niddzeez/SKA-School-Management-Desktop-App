import type { StudentStatus, CurrentStatus } from "./types";
import { UnprocessableError, ValidationError } from "./error";

// ---------------------------------------------------------------------------
// Student status
// ---------------------------------------------------------------------------

const VALID_STUDENT_STATUSES: StudentStatus[] = [
    "Active",
    "Inactive",
    "Alumni",
    "Transferred",
    "Withdrawn",
    "Expelled",
];

export const validateStudentStatus = (value: unknown): StudentStatus => {
    if (!value || typeof value !== "string") {
        throw new ValidationError("status is required");
    }
    if (!VALID_STUDENT_STATUSES.includes(value as StudentStatus)) {
        throw new UnprocessableError(
            `Invalid status '${value}'. Must be one of: ${VALID_STUDENT_STATUSES.join(", ")}`
        );
    }
    return value as StudentStatus;
};

// ---------------------------------------------------------------------------
// Teacher status
// ---------------------------------------------------------------------------

const VALID_TEACHER_STATUSES: CurrentStatus[] = ["Active", "Inactive"];

export const validateTeacherStatus = (value: unknown): CurrentStatus => {
    if (!value || typeof value !== "string") {
        throw new ValidationError("status is required");
    }
    if (!VALID_TEACHER_STATUSES.includes(value as CurrentStatus)) {
        throw new UnprocessableError(
            `Invalid status '${value}'. Must be one of: ${VALID_TEACHER_STATUSES.join(", ")}`
        );
    }
    return value as CurrentStatus;
};

// ---------------------------------------------------------------------------
// Required field helper
// ---------------------------------------------------------------------------

export const requireFields = (body: Record<string, unknown>, fields: string[]): void => {
    const missing = fields.filter((f) => body[f] === undefined || body[f] === null || body[f] === "");
    if (missing.length > 0) {
        throw new ValidationError(`Missing required field(s): ${missing.join(", ")}`);
    }
};

// ---------------------------------------------------------------------------
// ID Format guards
// ---------------------------------------------------------------------------

const MONGO_ID_RE = /^[0-9a-fA-F]{24}$/;

export const isMongoId = (id: string): boolean => {
    return MONGO_ID_RE.test(id);
};