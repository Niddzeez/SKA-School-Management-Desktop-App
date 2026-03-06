import { getPool } from "../../config/postgres";
import type { AuditRecord } from "../audit/audit.types";

/**
 * Retrieves paginated financial activity records for the admin activity feed.
 *
 * @param limit The maximum number of records to return (defaults to 20, max 100).
 * @param offset The number of records to skip (defaults to 0).
 * @returns Array of Raw `AuditRecord`s from the Postgres database.
 */
export async function getActivities(
    limitParam: number = 20,
    offsetParam: number = 0
): Promise<AuditRecord[]> {
    // Enforce parameter boundaries directly in the service to prevent runaway queries.
    const limit = Math.min(Math.max(1, limitParam), 100);
    const offset = Math.max(0, offsetParam);

    const { rows } = await getPool().query(
        `SELECT id,
                event_type   AS "eventType",
                entity_type  AS "entityType",
                entity_id    AS "entityId",
                performed_by AS "performedBy",
                metadata,
                created_at   AS "createdAt"
         FROM   financial_audits
         ORDER  BY created_at DESC
         LIMIT  $1
         OFFSET $2`,
        [limit, offset]
    );

    return rows;
}
