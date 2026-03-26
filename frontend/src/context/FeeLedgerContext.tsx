import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAcademicYear } from "./AcademicYearContext";
import { apiClient } from "../services/apiClient";

import type { StudentFeeLedger } from "../types/StudentFeeLedger";
import type { LedgerAdjustment } from "../types/LedgerAdjustments";
import type { Payment } from "../types/Payments";
import type { Expense } from "../types/Expenses";

/* =========================
   Types
========================= */

export type LedgerSummary = {
  baseTotal: number;
  adjustmentsTotal: number;
  finalFee: number;
  paid: number;
  paidTotal: number;
  pending: number;
  status: "PAID" | "PARTIAL" | "PENDING";
};

type FeeLedgerContextType = {
  ledgers: StudentFeeLedger[];
  adjustments: LedgerAdjustment[];
  payments: Payment[];
  expenses: Expense[];
  loading: boolean;
  error: string | null;

  createLedger: (
    studentId: string,
    classId: string,
    academicSessionId: string,
    baseComponents: { name: string; amount: number }[]
  ) => Promise<void>;

  

  upsertLedgerFromFeeStructure: (
    studentId: string,
    classId: string,
    academicSessionId: string,
    baseComponents: { name: string; amount: number }[]
  ) => Promise<void>;

  addAdjustment: (
    adjustment: Omit<LedgerAdjustment, "id" | "createdAt"> & {
      type: "DISCOUNT" | "CONCESSION" | "WAIVER" | "EXTRA" | "LATE_FEE";
      approvedBy: string;
    }
  ) => Promise<void>;

  addPayment: (
    payment: Omit<Payment, "id" | "createdAt"> & {
      mode: "CASH" | "UPI" | "BANK" | "CHEQUE";
      collectedBy: string;
      reference?: string;
    }
  ) => Promise<void>;

  addExpense: (
    expense: Omit<Expense, "id" | "recordedAt">
  ) => Promise<void>;

  getLedgerSummary: (ledgerId: string) => Promise<LedgerSummary>;
  getLedgerByStudentYear: (
    studentId: string,
    academicSessionId: string
  ) => Promise<StudentFeeLedger | undefined>;

  getReceiptNumber: (paymentId: string) => string;

  getLedgerSummariesByYear: (yearId: string) => Promise<StudentFeeLedger[]>;
};

/* =========================
   Context
========================= */

const FeeLedgerContext = createContext<FeeLedgerContextType | null>(null);

/* =========================
   Provider
========================= */

export function FeeLedgerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { activeYear } = useAcademicYear();

  /* -------------------------
     State
  ------------------------- */
  const [ledgers, setLedgers] = useState<StudentFeeLedger[]>([]);
  const [adjustments, setAdjustments] = useState<LedgerAdjustment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /* -------------------------
     Boot Check
  ------------------------- */
  const getLedgerSummariesByYear = async (yearId: string) => {
  return await apiClient.get<StudentFeeLedger[]>(
    `/api/ledgers?year=${yearId}`
  );
};

  const loadInitialData = async () => {
    if (!activeYear?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // Fetch constraints targeting current year context only to save memory
      const [ledgersData, expensesData] = await Promise.all([
        apiClient.get<StudentFeeLedger[]>(`/api/ledgers?year=${activeYear.id}`),
        apiClient.get<Expense[]>("/api/expenses")
      ]);

      // Remap the arrays into the frontend dictionary model if the frontend relies on them strongly
      const mappedLedgers = ledgersData.map((l: StudentFeeLedger) => ({
        ...l,
        baseComponents: l.baseComponents
      }));

      setLedgers(mappedLedgers);
      setExpenses(expensesData);
    } catch (err: any) {
      setError(err.message || "Failed to load initial fee data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [activeYear?.id]);


  /* =========================
     Transactions
  ========================= */

  const createLedger = async (
    studentId: string,
    classId: string,
    academicSessionId: string,
    baseComponents: { name: string; amount: number }[]
  ) => {
    try {
      setError(null);
      const created = await apiClient.post<StudentFeeLedger>("/api/ledgers", {
        studentId,
        classId,
        academicSessionId,
        baseComponents,
      });

      // Maintain legacy interface shapes locally 
      const mappedLedger = {
        ...created,
        baseComponents: created.baseComponents
      };

      setLedgers((prev) => [...prev, mappedLedger]);
    } catch (err: any) {
      setError(err.message || "Failed to create ledger");
      throw err;
    }
  };


  const upsertLedgerFromFeeStructure = async (
    studentId: string,
    classId: string,
    academicSessionId: string,
    baseComponents: { name: string; amount: number }[]
  ) => {
    try {
      setError(null);
      if (!academicSessionId) return;

      const results = await apiClient.get<StudentFeeLedger[]>(
        `/api/ledgers?studentId=${studentId}&year=${academicSessionId}`
      );

      if (results.length === 0) {

        // Create ledger
        const created = await apiClient.post<StudentFeeLedger>("/api/ledgers", {
          studentId,
          classId,
          academicSessionId,
          baseComponents
        });

        // update context cache
        setLedgers(prev => [...prev, created]);

        return;
      }

      const existing = results[0];

      // ensure cache contains the ledger
      setLedgers(prev => {
        const exists = prev.some(l => l.id === existing.id);
        return exists ? prev : [...prev, existing];
      });

      const summary = await getLedgerSummary(existing.id);

      if (summary.paidTotal === 0) {

        await apiClient.patch(`/api/ledgers/${existing.id}`, {
          baseComponents
        });

        setLedgers(prev =>
          prev.map(l =>
            l.id === existing.id
              ? { ...l, baseComponents }
              : l
          )
        );
      }

    } catch (err: any) {
      setError(err.message || "Failed to upsert ledger");
      throw err;
    }
  };


  const addAdjustment = async (
    adjustment: Omit<LedgerAdjustment, "id" | "createdAt"> & {
      type: "DISCOUNT" | "CONCESSION" | "WAIVER" | "EXTRA" | "LATE_FEE";
      approvedBy: string;
    }
  ) => {
    try {
      setError(null);
      const created = await apiClient.post<LedgerAdjustment>(
        `/api/ledgers/${adjustment.ledgerId}/adjustments`,
        adjustment
      );
      setAdjustments((prev) => [...prev, created]);
      const updatedSummary = await getLedgerSummary(adjustment.ledgerId);

      setLedgers(prev =>
        prev.map(l =>
          l.id === adjustment.ledgerId
            ? { ...l, ...updatedSummary }
            : l
        )
      );
    } catch (err: any) {
      setError(err.message || "Failed to add adjustment");
      throw err;
    }
  };


  const addPayment = async (
    payment: Omit<Payment, "id" | "createdAt"> & {
      mode: "CASH" | "UPI" | "BANK" | "CHEQUE";
      collectedBy: string;
      reference?: string;
    }
  ) => {
    try {
      setError(null);
      const created = await apiClient.post<Payment>(
        `/api/ledgers/${payment.ledgerId}/payments`,
        {
          amount: payment.amount,
          mode: payment.mode,
          collectedBy: payment.collectedBy,
          reference: payment.reference
        }
      );
      setPayments((prev) => [...prev, created]);
      // refresh ledger summary
      const updatedSummary = await getLedgerSummary(payment.ledgerId);

      setLedgers(prev =>
        prev.map(l =>
          l.id === payment.ledgerId
            ? { ...l, ...updatedSummary }
            : l
        )
      );
    } catch (err: any) {
      setError(err.message || "Failed to record payment");
      throw err;
    }
  };


  const addExpense = async (
    expense: Omit<Expense, "id" | "recordedAt">
  ) => {
    try {
      setError(null);
      const created = await apiClient.post<Expense>("/api/expenses", expense);
      setExpenses((prev) => [...prev, created]);
    } catch (err: any) {
      setError(err.message || "Failed to add expense");
      throw err;
    }
  };


  /* =========================
     Read Calculations
  ========================= */

  const getLedgerSummary = useCallback(async (ledgerId: string): Promise<LedgerSummary> => {
    try {
      setError(null);
      return await apiClient.get<LedgerSummary>(`/api/ledgers/${ledgerId}/summary`);
    } catch (err: any) {
      setError(err.message || "Failed to calculate summary");
      throw err;
    }
  }, []
  );

  const loadLedgerHistory = async (ledgerId: string) => {
    const [paymentsData, adjustmentsData] = await Promise.all([
      apiClient.get<Payment[]>(`/api/ledgers/${ledgerId}/payments`),
      apiClient.get<LedgerAdjustment[]>(`/api/ledgers/${ledgerId}/adjustments`)
    ]);

    setPayments(paymentsData);
    setAdjustments(adjustmentsData);
  };

  const getLedgerByStudentYear = useCallback(
    async (
      studentId: string,
      academicSessionId: string
    ): Promise<StudentFeeLedger | undefined> => {
      try {
        setError(null);

        // 1. Check cache
        const existing = ledgers.find(
          (l) =>
            l.studentId === studentId &&
            l.academicSessionId === academicSessionId
        );

        if (existing) {
          await loadLedgerHistory(existing.id);
          return existing;
        }

        // 2. Fetch ledger
        const results = await apiClient.get<StudentFeeLedger[]>(
          `/api/ledgers?studentId=${studentId}&year=${academicSessionId}`
        );

        if (results.length === 0) return undefined;

        const ledger = results[0];

        setLedgers(prev => {
          const exists = prev.some(l => l.id === ledger.id);
          if (exists) return prev;
          return [...prev, ledger];
        });

        // 3. Load historical payments and adjustments
        await loadLedgerHistory(ledger.id);

        return ledger;

      } catch (err: any) {
        setError(err.message || "Failed to retrieve specific ledger");
        throw err;
      }
    }, [ledgers]
  );

  /* =========================
     Compatibility Helpers
  ========================= */

  const getReceiptNumber = (paymentId: string) => {
    return `REC-${paymentId.slice(0, 8).toUpperCase()}`;
  };

  /* =========================
     Provider Payload
  ========================= */

  return (
    <FeeLedgerContext.Provider
      value={{
        ledgers,
        adjustments,
        payments,
        expenses,
        loading,
        error,

        createLedger,
        upsertLedgerFromFeeStructure,
        addAdjustment,
        addPayment,
        addExpense,

        getLedgerSummary,
        getLedgerByStudentYear,
        getReceiptNumber,
        getLedgerSummariesByYear,
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
