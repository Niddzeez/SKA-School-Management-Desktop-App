import type { AuditRecord } from "../../finance/audit/audit.types";

export interface ActivityResponse {
    id: string;
    eventType: string;
    entityType: string;
    entityId: string;
    performedBy: string;
    metadata: Record<string, unknown> | null;
    createdAt: string;
    // Optional enriched fields (populated by the route)
    performedByName?: string;
    studentName?: string;
    className?: string;
}

/**
 * Maps a raw AuditRecord from the database to an ActivityResponse.
 * Because Postgres column aliases already handle camelCase for us, 
 * this mainly maps timestamps. 
 */
export function mapActivity(row: AuditRecord): ActivityResponse {
    return {
        id: row.id,
        eventType: row.eventType,
        entityType: row.entityType,
        entityId: row.entityId,
        performedBy: row.performedBy,
        metadata: row.metadata ?? null,
        createdAt: row.createdAt instanceof Date
            ? row.createdAt.toISOString()
            : String(row.createdAt),
    };
}
