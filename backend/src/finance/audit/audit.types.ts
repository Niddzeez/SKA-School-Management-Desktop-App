export const AUDIT_EVENT_TYPES = [
    "LEDGER_CREATED",
    "PAYMENT_RECORDED",
    "ADJUSTMENT_ADDED",
    "EXPENSE_CREATED",
    "ACADEMIC_YEAR_CLOSED",
    "LEDGER_BASE_COMPONENTS_UPDATED"
] as const;

export type AuditEventType = typeof AUDIT_EVENT_TYPES[number];

export interface AuditRecord {
    id: string;
    eventType: AuditEventType;
    entityType: string;
    entityId: string; // UUID
    performedBy: string; // User ID from decoded JWT
    metadata?: Record<string, unknown>;
    createdAt: Date;
}
