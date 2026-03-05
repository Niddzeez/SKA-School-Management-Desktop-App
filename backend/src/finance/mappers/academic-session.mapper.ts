import type { AcademicSessionRow } from "../types";

/**
 * Maps an academic_sessions Postgres row to the frontend AcademicYear shape.
 *
 * Frontend AcademicYearMeta (AcademicYearContext):
 *   { year: string; status: "OPEN" | "CLOSED"; closedAt?: string }
 *
 * We return a slightly richer shape that also includes the UUID id,
 * start_date and end_date for completeness.
 */
export const mapAcademicSession = (row: AcademicSessionRow) => ({
    id: row.id,
    year: row.name,
    startDate: row.start_date instanceof Date
        ? row.start_date.toISOString()
        : String(row.start_date),
    endDate: row.end_date instanceof Date
        ? row.end_date.toISOString()
        : String(row.end_date),
    status: row.is_closed ? "CLOSED" as const : "OPEN" as const,
    closedAt: row.closed_at instanceof Date
        ? row.closed_at.toISOString()
        : row.closed_at ?? undefined,
    createdAt: row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
});
