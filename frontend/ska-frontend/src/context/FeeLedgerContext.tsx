import { createContext, useContext } from "react";
import { usePersistentState } from "../hooks/UsePersistentState";
import { useAcademicYear } from "./AcademicYearContext";

import type { StudentFeeLedger } from "../types/StudentFeeLedger";
import type { LedgerAdjustment } from "../types/LedgerAdjustments";
import type { Payment } from "../types/Payments";
import type { Expense } from "../types/Expenses";

/* =========================
   Types
========================= */

type LedgerSummary = {
  baseTotal: number;
  adjustmentsTotal: number;
  finalFee: number;

  paid: number;
  paidTotal: number; // backward compatibility

  pending: number;
  status: "PAID" | "PARTIAL" | "PENDING";
};

type FeeLedgerContextType = {
  ledgers: StudentFeeLedger[];
  adjustments: LedgerAdjustment[];
  payments: Payment[];
  expenses: Expense[];

  createLedger: (
    studentId: string,
    classId: string,
    academicYear: string,
    baseComponents: StudentFeeLedger["baseComponents"]
  ) => void;

  upsertLedgerFromFeeStructure: (
    studentId: string,
    classId: string,
    academicYear: string,
    baseComponents: StudentFeeLedger["baseComponents"]
  ) => void;

  addAdjustment: (
    adjustment: Omit<LedgerAdjustment, "id" | "createdAt">
  ) => void;

  addPayment: (
    payment: Omit<Payment, "id" | "createdAt">
  ) => void;

  addExpense: (
    expense: Omit<Expense, "id" | "recordedAt">
  ) => void;

  getLedgerSummary: (ledgerId: string) => LedgerSummary;
  getLedgerByStudentYear: (
    studentId: string,
    academicYear: string
  ) => StudentFeeLedger | undefined;

  getReceiptNumber: (paymentId: string) => string;
};

/* =========================
   Context
========================= */

const FeeLedgerContext =
  createContext<FeeLedgerContextType | null>(null);

/* =========================
   Helpers
========================= */

function getAcademicYearFromDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0 = Jan

  if (month >= 3) {
    return `${year}-${String(year + 1).slice(-2)}`;
  } else {
    return `${year - 1}-${String(year).slice(-2)}`;
  }
}

/* =========================
   Provider
========================= */

export function FeeLedgerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { academicYear, isYearClosed } = useAcademicYear();

  /* -------------------------
     Persistent State
  ------------------------- */

  const [ledgers, setLedgers] =
    usePersistentState<StudentFeeLedger[]>("ledgers", []);

  const [adjustments, setAdjustments] =
    usePersistentState<LedgerAdjustment[]>("adjustments", []);

  const [payments, setPayments] =
    usePersistentState<Payment[]>("payments", []);

  const [expenses, setExpenses] =
    usePersistentState<Expense[]>("expenses", []);

  /* =========================
     Ledger Creation
  ========================= */

  const createLedger = (
    studentId: string,
    classId: string,
    academicYear: string,
    baseComponents: StudentFeeLedger["baseComponents"]
  ) => {
    if (isYearClosed(academicYear)) {
      throw new Error(
        "Cannot create ledger for a closed academic year"
      );
    }

    const exists = ledgers.find(
      (l) =>
        l.studentId === studentId &&
        l.academicYear === academicYear
    );

    if (exists) {
      throw new Error("Ledger already exists");
    }

    setLedgers((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        studentId,
        classId,
        academicYear,
        baseComponents,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  /* =========================
     Ledger Upsert (Promotion / Fee Activation)
  ========================= */

  const upsertLedgerFromFeeStructure = (
    studentId: string,
    classId: string,
    academicYear: string,
    baseComponents: StudentFeeLedger["baseComponents"]
  ) => {
    if (isYearClosed(academicYear)) return;

    setLedgers((prev) => {
      const existing = prev.find(
        (l) =>
          l.studentId === studentId &&
          l.academicYear === academicYear
      );

      if (!existing) {
        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            studentId,
            classId,
            academicYear,
            baseComponents,
            createdAt: new Date().toISOString(),
          },
        ];
      }

      const hasPayments = payments.some(
        (p) => p.ledgerId === existing.id
      );

      if (!hasPayments) {
        return prev.map((l) =>
          l.id === existing.id
            ? { ...l, baseComponents }
            : l
        );
      }

      return prev;
    });
  };

  /* =========================
     Adjustments (BLOCKED if closed)
  ========================= */

  const addAdjustment = (
    adjustment: Omit<LedgerAdjustment, "id" | "createdAt">
  ) => {
    const ledger = ledgers.find(
      (l) => l.id === adjustment.ledgerId
    );

    if (!ledger) throw new Error("Ledger not found");

    if (isYearClosed(ledger.academicYear)) {
      throw new Error(
        "Cannot add adjustment to a closed academic year"
      );
    }

    setAdjustments((prev) => [
      ...prev,
      {
        ...adjustment,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  /* =========================
     Payments (ALLOWED if closed)
  ========================= */

  const addPayment = (
    payment: Omit<Payment, "id" | "createdAt">
  ) => {
    if (payment.amount <= 0) {
      throw new Error("Payment amount must be positive");
    }

    const ledger = ledgers.find(
      (l) => l.id === payment.ledgerId
    );

    if (!ledger) throw new Error("Ledger not found");

    const closed = isYearClosed(ledger.academicYear);

    

    setPayments((prev) => [
      ...prev,
      {
        ...payment,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        isLateSettlement: closed ? true : false,
        settledInYear: closed ? academicYear : undefined,
      },
    ]);
  };

  /* =========================
     Expenses (BLOCKED if closed)
  ========================= */

  const addExpense = (
    expense: Omit<Expense, "id" | "recordedAt">
  ) => {
    if (expense.amount <= 0) {
      throw new Error("Expense amount must be positive");
    }

    const expenseYear = getAcademicYearFromDate(
      new Date(expense.expenseDate)
    );

    if (isYearClosed(expenseYear)) {
      throw new Error(
        "Cannot add expense to a closed academic year"
      );
    }

    setExpenses((prev) => [
      ...prev,
      {
        ...expense,
        id: crypto.randomUUID(),
        recordedAt: new Date().toISOString(),
      },
    ]);
  };

  /* =========================
     Ledger Summary
  ========================= */

  const getLedgerSummary = (ledgerId: string): LedgerSummary => {
    const ledger = ledgers.find((l) => l.id === ledgerId);
    if (!ledger) throw new Error("Ledger not found");

    const baseTotal = Object.values(
      ledger.baseComponents
    ).reduce((sum, c) => sum + c.amount, 0);

    const adjustmentsTotal = adjustments
      .filter((a) => a.ledgerId === ledgerId)
      .reduce((sum, a) => sum + a.amount, 0);

    const paid = payments
      .filter((p) => p.ledgerId === ledgerId)
      .reduce((sum, p) => sum + p.amount, 0);

    const finalFee = baseTotal + adjustmentsTotal;
    const pending = finalFee - paid;

    let status: LedgerSummary["status"] = "PENDING";
    if (pending <= 0) status = "PAID";
    else if (paid > 0) status = "PARTIAL";

    return {
      baseTotal,
      adjustmentsTotal,
      finalFee,
      paid,
      paidTotal: paid, // compatibility
      pending,
      status,
    };
  };

  /* =========================
     Compatibility Helpers
  ========================= */

  const getLedgerByStudentYear = (
    studentId: string,
    academicYear: string
  ) => {
    return ledgers.find(
      (l) =>
        l.studentId === studentId &&
        l.academicYear === academicYear
    );
  };

  const getReceiptNumber = (paymentId: string) => {
    return `REC-${paymentId
      .slice(0, 8)
      .toUpperCase()}`;
  };

  /* =========================
     Provider
  ========================= */

  return (
    <FeeLedgerContext.Provider
      value={{
        ledgers,
        adjustments,
        payments,
        expenses,
        createLedger,
        upsertLedgerFromFeeStructure,
        addAdjustment,
        addPayment,
        addExpense,
        getLedgerSummary,
        getLedgerByStudentYear,
        getReceiptNumber,
      }}
    >
      {children}
    </FeeLedgerContext.Provider>
  );
}

/* =========================
   Hook
========================= */

export function useFeeLedger() {
  const ctx = useContext(FeeLedgerContext);
  if (!ctx) {
    throw new Error(
      "useFeeLedger must be used within FeeLedgerProvider"
    );
  }
  return ctx;
}
