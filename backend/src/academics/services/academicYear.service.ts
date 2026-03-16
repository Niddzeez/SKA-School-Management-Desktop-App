import { getPool } from "../../config/postgres";

export type AcademicYear = {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isClosed: boolean;
    isPromotionLocked: boolean;
};

export async function getSessionStates() {
    const pool = getPool();

    const { rows } = await pool.query<AcademicYear>(`
    SELECT
      id,
      name,
      start_date as "startDate",
      end_date as "endDate",
      is_closed as "isClosed",
      is_promotion_locked as "isPromotionLocked"
    FROM academic_sessions
    ORDER BY start_date ASC
  `);

    const today = new Date();

    let current: AcademicYear | null = null;
    let next: AcademicYear | null = null;
    const past: AcademicYear[] = [];

    for (const session of rows) {
        const start = new Date(session.startDate);
        const end = new Date(session.endDate);

        if (today >= start && today <= end) {
            current = session;
        } else if (today < start && !next) {
            next = session;
        } else if (today > end) {
            past.push(session);
        }
    }

    return { current, next, past };
}