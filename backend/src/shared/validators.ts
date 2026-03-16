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

const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUUID = (id: string): boolean => {
    return UUID_RE.test(id);
};

// ---------------------------------------------------------------------------
// Finance enum validators (Phase 5)
// ---------------------------------------------------------------------------

const VALID_ADJUSTMENT_TYPES = [
    "DISCOUNT", "CONCESSION", "WAIVER", "EXTRA", "LATE_FEE",
] as const;

export type AdjustmentType = typeof VALID_ADJUSTMENT_TYPES[number];

export const validateAdjustmentType = (value: unknown): AdjustmentType => {
    if (!value || typeof value !== "string") {
        throw new ValidationError("'type' is required");
    }
    if (!VALID_ADJUSTMENT_TYPES.includes(value as AdjustmentType)) {
        throw new UnprocessableError(
            `Invalid adjustment type '${value}'. Must be one of: ${VALID_ADJUSTMENT_TYPES.join(", ")}`
        );
    }
    return value as AdjustmentType;
};

const VALID_PAYMENT_MODES = [
    "CASH", "UPI", "BANK", "CARD", "CHEQUE",
] as const;

export type PaymentMode = typeof VALID_PAYMENT_MODES[number];

export const validatePaymentMode = (value: unknown): PaymentMode => {
    if (!value || typeof value !== "string") {
        throw new ValidationError("'mode' is required");
    }
    if (!VALID_PAYMENT_MODES.includes(value as PaymentMode)) {
        throw new UnprocessableError(
            `Invalid payment mode '${value}'. Must be one of: ${VALID_PAYMENT_MODES.join(", ")}`
        );
    }
    return value as PaymentMode;
};

const VALID_EXPENSE_CATEGORIES = [
    "SALARY", "UTILITY", "MAINTENANCE", "PURCHASE", "OTHER",
] as const;

export type ExpenseCategory = typeof VALID_EXPENSE_CATEGORIES[number];

export const validateExpenseCategory = (value: unknown): ExpenseCategory => {
    if (!value || typeof value !== "string") {
        throw new ValidationError("'category' is required");
    }
    if (!VALID_EXPENSE_CATEGORIES.includes(value as ExpenseCategory)) {
        throw new UnprocessableError(
            `Invalid expense category '${value}'. Must be one of: ${VALID_EXPENSE_CATEGORIES.join(", ")}`
        );
    }
    return value as ExpenseCategory;
};

const VALID_EXPENSE_MODES = ["CASH", "BANK", "UPI"] as const;

export type ExpenseMode = typeof VALID_EXPENSE_MODES[number];

export const validateExpenseMode = (value: unknown): ExpenseMode => {
    if (!value || typeof value !== "string") {
        throw new ValidationError("'mode' is required");
    }
    if (!VALID_EXPENSE_MODES.includes(value as ExpenseMode)) {
        throw new UnprocessableError(
            `Invalid expense mode '${value}'. Must be one of: ${VALID_EXPENSE_MODES.join(", ")}`
        );
    }
    return value as ExpenseMode;
};

// ---------------------------------------------------------------------------
// Auth validators (Phase 8)
// ---------------------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (value: unknown): string => {
    if (!value || typeof value !== "string") {
        throw new ValidationError("'email' is required");
    }
    const trimmed = value.trim().toLowerCase();
    if (!EMAIL_RE.test(trimmed)) {
        throw new ValidationError("'email' must be a valid email address");
    }
    return trimmed;
};

export const validatePassword = (value: unknown): string => {
    if (!value || typeof value !== "string") {
        throw new ValidationError("'password' is required");
    }

    const password = value.trim();

    const passwordRegex =
        /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\\/]).{12,}$/;

    if (!passwordRegex.test(password)) {
        throw new ValidationError(
            "'password' must be at least 12 characters long and include at least one number and one special character"
        );
    }

    return password;
};

const VALID_ROLES = ["ADMIN", "TEACHER"] as const;
export type UserRole = typeof VALID_ROLES[number];

export const validateRole = (value: unknown): UserRole => {
    if (!value || typeof value !== "string") {
        throw new ValidationError("'role' is required");
    }
    if (!VALID_ROLES.includes(value as UserRole)) {
        throw new UnprocessableError(
            `Invalid role '${value}'. Must be one of: ${VALID_ROLES.join(", ")}`
        );
    }
    return value as UserRole;
};