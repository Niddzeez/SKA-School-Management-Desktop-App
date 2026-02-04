import type { Role } from "../types/Role";

export const permissions = {
  VIEW_STUDENTS: ["ADMIN", "TEACHER"],
  VIEW_STUDENT_DETAILS: ["ADMIN", "TEACHER"],
  VIEW_LEDGER: ["ADMIN", "TEACHER"],
  PRINT_REGISTER: ["ADMIN", "TEACHER"],

  ADMIT_STUDENT: ["ADMIN"],
  WITHDRAW_STUDENT: ["ADMIN"],
  PROMOTE_STUDENT: ["ADMIN"],
  ASSIGN_CLASS: ["ADMIN"],
  ADD_PAYMENT: ["ADMIN"],
  ADD_ADJUSTMENT: ["ADMIN"],
  VIEW_REPORTS: ["ADMIN"],
  CLOSE_ACADEMIC_YEAR: ["ADMIN"],
};

export type Permission = keyof typeof permissions;

export function can(role: Role, permission: Permission) {
  return permissions[permission].includes(role);
}
