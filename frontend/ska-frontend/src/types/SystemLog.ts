export type SystemLogEvent =
  | "ACADEMIC_YEAR_CLOSED"
  | "BULK_PROMOTION_RUN"
  | "FEE_STRUCTURE_ACTIVATED"
  | "BACKUP_RESTORED";

export type SystemLog = {
  id: string;
  event: SystemLogEvent;
  academicYear: string;
  timestamp: string;
  details?: string;
};
