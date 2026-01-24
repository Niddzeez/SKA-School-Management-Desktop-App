export const SEED_ACADEMIC_YEAR = "2025-26";

import type { Class } from "../types/Class";

export const seedClasses: Class[] = [
  {
    id: "class-1",
    ClassName: "Class 1",
  },
  {
    id: "class-2",
    ClassName: "Class 2",
  },
  {
    id: "class-3",
    ClassName: "Class 3",
  },
];

import type { Teacher } from "../types/Teachers";

export const seedTeachers = [
  {
    id: "teacher-1",
    firstName: "Ramesh",
    lastName: "Kulkarni",
    aadharNumber: "734912345678",
    phone: "9876543210",
    email: "ramesh.k@school.com",
    subject: "Mathematics",
    designation: "Senior Teacher",
    joiningDate: "2022-06-01",
    status: "ACTIVE",
    createdAt: "2022-06-01",
    updatedAt: "2025-03-01",
  },
  {
    id: "teacher-2",
    firstName: "Sunita",
    lastName: "Patil",
    aadharNumber: "812345679012",
    phone: "9123456780",
    email: "sunita.p@school.com",
    subject: "English",
    designation: "Teacher",
    joiningDate: "2023-06-01",
    status: "ACTIVE",
    createdAt: "2023-06-01",
    updatedAt: "2025-03-01",
  },
];


export const seedClassFeeStructures = [
  {
    id: "cfs-1",
    classId: "class-1",
    academicYear: SEED_ACADEMIC_YEAR,
    tuitionFee: 18000,
    examFee: 3000,
    activityFee: 3000,
    totalFee: 24000,
    status: "ACTIVE",
    createdAt: "2025-03-10",
    updatedAt: "2025-03-10",
  },
];


export const seedLedgerAdjustments = [
  {
    id: "adj-1",
    ledgerId: "ledger-1",
    adjustmentType: "DISCOUNT",
    amount: 2000,
    reason: "Sibling discount",
    appliedBy: "Admin",
    createdAt: "2025-06-01",
  },
];

export const seedPayments = [
  {
    id: "payment-1",
    ledgerId: "ledger-1",
    studentId: "student-1",
    amount: 8000,
    mode: "CASH",
    reference: null,
    collectedBy: "Admin",
    academicYear: SEED_ACADEMIC_YEAR,
    createdAt: "2025-04-20",
  },
  {
    id: "payment-2",
    ledgerId: "ledger-2",
    studentId: "student-2",
    amount: 6000,
    mode: "UPI",
    reference: "UPI123456",
    collectedBy: "Admin",
    academicYear: SEED_ACADEMIC_YEAR,
    createdAt: "2025-06-15",
  },
];


export const seedExpenses = [
  {
    id: "expense-1",
    category: "SALARY",
    paidTo: "Teaching Staff",
    amount: 12000,
    description: "April salary payout",
    academicYear: SEED_ACADEMIC_YEAR,
    expenseDate: "2025-04-30",
    createdAt: "2025-04-30",
  },
  {
    id: "expense-2",
    category: "MAINTENANCE",
    paidTo: "Building Repair",
    amount: 3000,
    description: "Water leakage repair",
    academicYear: SEED_ACADEMIC_YEAR,
    expenseDate: "2025-05-20",
    createdAt: "2025-05-20",
  },
];



