import { getPool } from "../../config/postgres";
import type { AuditEventType } from "./audit.types";

/**
 * Audit log recording service.
 * Designed to be called after a successful financial transaction.
 * Failures here are caught and logged to console.error, 
 * ensuring they never interrupt the main financial workflow.
 */
export async function logFinancialEvent(
    eventType: AuditEventType,
    entityType: string,
    entityId: string,
    performedBy: string,
    metadata?: Record<string, unknown>
): Promise<void> {
    try {
        await getPool().query(
            `INSERT INTO financial_audits 
             (event_type, entity_type, entity_id, performed_by, metadata)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                eventType,
                entityType,
                entityId,
                performedBy,
                metadata ? JSON.stringify(metadata) : null,
            ]
        );
    } catch (error) {
        // We log the error but DO NOT throw it.
        // Rule: "Errors during audit logging should be safely handled. 
        // Do not allow audit logging failures to interrupt financial workflows."
        console.error("[Financial Audit Error] Failed to log event:", {
            eventType,
            entityType,
            entityId,
            performedBy,
            error,
        });
    }
}
