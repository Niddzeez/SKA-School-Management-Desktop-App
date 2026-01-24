import { createContext, useContext, type ReactNode } from "react";
import type { StudentFeeLedger } from "../types/StudentFeeLedger";
import type { Payment } from "../types/Payments";
import type { Expense } from "../types/Expenses";
import { usePersistentState } from "../hooks/UsePersistentState";

/* =========================
   Types internal to context
========================= */

type LedgerAdjustmentType =
    | "DISCOUNT"
    | "CONCESSION"
    | "WAIVER"
    | "EXTRA"
    | "LATE_FEE";

export type LedgerAdjustment = {
    id: string;
    ledgerId: string;
    type: LedgerAdjustmentType;
    amount: number; // negative or positive
    reason: string;
    approvedBy: string;
    createdAt: string;
};

export type LedgerSummary = {
    baseTotal: number;
    adjustmentsTotal: number;
    finalFee: number;
    paidTotal: number;
    pending: number;
    status: "PAID" | "PENDING" | "PARTIAL" | "OVERPAID";
};

type FeeLedgerContextType = {
    // tables
    ledgers: StudentFeeLedger[];
    adjustments: LedgerAdjustment[];
    payments: Payment[];
    expenses: Expense[];

    // mutations (INSERT only)
    createLedger: (
        studentId: string,
        classId: string,
        academicYear: string,
        baseComponents: StudentFeeLedger["baseComponents"]
    ) => void;

    addAdjustment: (adjustment: Omit<LedgerAdjustment, "id" | "createdAt">) => void;

    addPayment: (payment: Omit<Payment, "id" | "createdAt">) => void;

    addExpense: (expense: Omit<Expense, "id" | "recordedAt">) => void;

    upsertLedgerFromFeeStructure: (
        studentId: string,
        classId: string,
        academicYear: string,
        baseComponents: StudentFeeLedger["baseComponents"]
    ) => void;

    // selectors (VIEWS)
    getLedgerByStudentYear: (
        studentId: string,
        academicYear: string
    ) => StudentFeeLedger | undefined;

    getLedgerSummary: (ledgerId: string) => LedgerSummary;

    getReceiptsForStudent: (studentId: string) => Payment[];

    getNetBalance: () => number;

    getReceiptNumber : (paymentId: string, academicYear: string) => string;
};



const FeeLedgerContext = createContext<FeeLedgerContextType | null>(null);



/* =========================
   Provider
========================= */

export function FeeLedgerProvider({ children }: { children: ReactNode }) {
    const [ledgers, setLedgers] = usePersistentState<StudentFeeLedger[]>("ledgers", []);
    const [adjustments, setAdjustments] = usePersistentState<LedgerAdjustment[]>("adjustments", []);
    const [payments, setPayments] = usePersistentState<Payment[]>("payments", []);
    const [expenses, setExpenses] = usePersistentState<Expense[]>("expenses", []);

    /* =========================
       Mutations (SQL INSERT)
    ========================= */

    const createLedger = (
        studentId: string,
        classId: string,
        academicYear: string,
        baseComponents: StudentFeeLedger["baseComponents"]
    ) => {
        const existing = ledgers.find(
            (l) => l.studentId === studentId && l.academicYear === academicYear
        );

        if (existing) {
            throw new Error(
                "Ledger already exists for this student and academic year"
            );
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

    const addAdjustment = (
        adjustment: Omit<LedgerAdjustment, "id" | "createdAt">
    ) => {
        setAdjustments((prev) => [
            ...prev,
            {
                ...adjustment,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
            },
        ]);
    };

    const addPayment = (payment: Omit<Payment, "id" | "createdAt">) => {
        if (payment.amount <= 0) {
            throw new Error("Payment amount must be positive");
        }

        setPayments((prev) => [
            ...prev,
            {
                ...payment,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
            },
        ]);
    };

    const addExpense = (expense: Omit<Expense, "id" | "recordedAt">) => {
        if (expense.amount <= 0) {
            throw new Error("Expense amount must be positive");
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

    const getReceiptNumber = (paymentId: string, academicYear: string) => {
        // Get all payments for that academic year
        const yearPayments = payments
            .filter((p) => {
                const ledger = ledgers.find(l => l.id === p.ledgerId);
                return ledger?.academicYear === academicYear;
            })
            .sort(
                (a, b) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
            );

        const index = yearPayments.findIndex(p => p.id === paymentId);
        if (index === -1) return "—";

        const sequence = String(index + 1).padStart(6, "0");

        return `SKA/${academicYear}/${sequence}`;
    };


    /* =========================
       Selectors (SQL VIEWS)
    ========================= */

    const getLedgerByStudentYear = (
        studentId: string,
        academicYear: string
    ) => {
        return ledgers.find(
            (l) => l.studentId === studentId && l.academicYear === academicYear
        );
    };

    const getLedgerSummary = (ledgerId: string): LedgerSummary => {
        const ledger = ledgers.find((l) => l.id === ledgerId);
        if (!ledger) {
            throw new Error("Ledger not found");
        }

        const baseTotal = ledger.baseComponents.reduce(
            (sum, c) => sum + c.amount,
            0
        );

        const adjustmentsTotal = adjustments
            .filter((a) => a.ledgerId === ledgerId)
            .reduce((sum, a) => sum + a.amount, 0);

        const paidTotal = payments
            .filter((p) => p.ledgerId === ledgerId)
            .reduce((sum, p) => sum + p.amount, 0);

        const finalFee = baseTotal + adjustmentsTotal;
        const pending = finalFee - paidTotal;

        let status: LedgerSummary["status"] = "PENDING";
        if (pending === 0) status = "PAID";
        else if (pending < 0) status = "OVERPAID";
        else if (paidTotal > 0) status = "PARTIAL";

        return {
            baseTotal,
            adjustmentsTotal,
            finalFee,
            paidTotal,
            pending,
            status,
        };
    };

    const upsertLedgerFromFeeStructure = (
        studentId: string,
        classId: string,
        academicYear: string,
        baseComponents: StudentFeeLedger["baseComponents"]
    ) => {
        setLedgers((prev) => {
            const existing = prev.find(
                (l) =>
                    l.studentId === studentId &&
                    l.academicYear === academicYear
            );

            // CASE 1: Ledger does not exist → create
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

            // CASE 2: Ledger exists BUT no payments → re-snapshot
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

            // CASE 3: Ledger exists AND payments exist → frozen
            return prev;
        });
    };


    const getReceiptsForStudent = (studentId: string) => {
        return payments
            .filter((p) => p.studentId === studentId)
            .sort(
                (a, b) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
            );
    };

    const getNetBalance = () => {
        const totalIncome = payments.reduce(
            (sum, p) => sum + p.amount,
            0
        );
        const totalExpense = expenses.reduce(
            (sum, e) => sum + e.amount,
            0
        );

        return totalIncome - totalExpense;
    };

    return (
        <FeeLedgerContext.Provider
            value={{
                ledgers,
                adjustments,
                payments,
                expenses,
                createLedger,
                addAdjustment,
                addPayment,
                addExpense,
                getLedgerByStudentYear,
                getLedgerSummary,
                getReceiptsForStudent,
                getNetBalance,
                upsertLedgerFromFeeStructure,
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
            "useFeeLedger must be used inside FeeLedgerProvider"
        );
    }
    return ctx;
}
