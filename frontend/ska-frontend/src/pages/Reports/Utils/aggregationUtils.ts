// aggregationUtils.ts
import type { Expense } from "../../../types/Expenses";
import type { Payment } from "../../../types/Payments";
import { getAcademicYearRange } from "./reportDateUtils";

/* =========================
   Expense Aggregations
========================= */

export function filterExpensesByAcademicYear(
  expenses: Expense[],
  academicYear: string
) {
  const { start, end } = getAcademicYearRange(academicYear);
  return expenses.filter((e) => {
    const d = new Date(e.expenseDate);
    return d >= start && d <= end;
  });
}

export function sumExpenses(expenses: Expense[]) {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function groupExpensesByCategory(expenses: Expense[]) {
  return expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
}

/* =========================
   Income Aggregations
========================= */


export function filterPaymentsByAcademicYear(
  payments: any[],
  academicYear: string
) {
  const { start, end } = getAcademicYearRange(academicYear);

  return payments.filter((p) => {
    const d = new Date(p.createdAt);
    return d >= start && d <= end;
  });
}


export function sumPayments(payments: Payment[]) {
  return payments.reduce((sum, p) => sum + p.amount, 0);
}

/* =========================
   Date Filters
========================= */

export function filterByMonth<T extends { expenseDate?: string; createdAt?: string }>(
  items: T[],
  month: number
) {
  return items.filter((i) => {
    const date = new Date(
      i.expenseDate ?? i.createdAt!
    );
    return date.getMonth() === month;
  });
}

export function filterByDate<T extends { expenseDate?: string; createdAt?: string }>(
  items: T[],
  dateStr: string
) {
  return items.filter((i) => {
    const date = new Date(
      i.expenseDate ?? i.createdAt!
    ).toISOString().slice(0, 10);
    return date === dateStr;
  });
}
