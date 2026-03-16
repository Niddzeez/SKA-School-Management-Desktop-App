import { ValidationError } from "./error";

export const YEAR_RE = /^\d{4}-\d{2}$/;
export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function normalizeAcademicYear(year: string): string {
    const [start, end] = year.split("-");
    if (end.length === 2) {
        return `${start}-20${end}`;
    }
    return year;
}

export function extractReportParams(query: any) {
    const { year, fromDate, toDate } = query;

    if (!year || typeof year !== "string" || !YEAR_RE.test(year)) {
        throw new ValidationError(
            "Query parameter 'year' must match YYYY-YY (e.g. '2025-26')"
        );
    }

    const from = typeof fromDate === "string" ? fromDate : undefined;
    const to = typeof toDate === "string" ? toDate : undefined;

    if (from && !ISO_DATE.test(from)) {
        throw new ValidationError("'fromDate' must be YYYY-MM-DD");
    }

    if (to && !ISO_DATE.test(to)) {
        throw new ValidationError("'toDate' must be YYYY-MM-DD");
    }

    return {
        year: normalizeAcademicYear(year),
        fromDate: from,
        toDate: to
    };
}