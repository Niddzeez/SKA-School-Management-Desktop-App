import { createContext, useContext, useState } from "react";
import { usePersistentState } from "../hooks/UsePersistentState";

/* =========================
   Types
========================= */

type AcademicYearStatus = "OPEN" | "CLOSED";

type AcademicYearMeta = {
    year: string;
    status: AcademicYearStatus;
    closedAt?: string;
};

type AcademicYearContextType = {
    academicYear: string;
    setAcademicYear: (year: string) => void;

    availableYears: string[];
    closeYear: (year: string) => void;
    isYearClosed: (year: string) => boolean;
};

/* =========================
   Context
========================= */

const AcademicYearContext =
    createContext<AcademicYearContextType | null>(null);

/* =========================
   Helpers
========================= */

function getCurrentAcademicYear() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0 = Jan

    if (month >= 3) {
        // Apr–Dec → 2025-26
        return `${year}-${String(year + 1).slice(-2)}`;
    } else {
        // Jan–Mar → 2024-25
        return `${year - 1}-${String(year).slice(-2)}`;
    }
}

const CURRENT_ACADEMIC_YEAR = getCurrentAcademicYear();

/* =========================
   Provider
========================= */

export function AcademicYearProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    /* -------------------------
       Current academic year
    ------------------------- */
    const [academicYear, setAcademicYear] =
        usePersistentState<string>(
            "academicYear",
            CURRENT_ACADEMIC_YEAR
        );

    /* -------------------------
       Available years (UI)
    ------------------------- */
    const [availableYears] = useState<string[]>([
        "2025-26",
        "2026-27",
        "2027-28",
    ]);

    /* -------------------------
       Persistent year metadata
    ------------------------- */
    const [yearMeta, setYearMeta] =
        usePersistentState<AcademicYearMeta[]>(
            "academicYearMeta",
            availableYears.map((year) => ({
                year,
                status:
                    year === CURRENT_ACADEMIC_YEAR
                        ? "OPEN"
                        : "OPEN",
            }))
        );

    /* =========================
       Actions
    ========================= */

    const closeYear = (year: string) => {
        setYearMeta((prev) =>
            prev.map((y) =>
                y.year === year
                    ? {
                          ...y,
                          status: "CLOSED",
                          closedAt:
                              y.closedAt ??
                              new Date().toISOString(),
                      }
                    : y
            )
        );
    };

    const isYearClosed = (year: string) => {
        return (
            yearMeta.find((y) => y.year === year)
                ?.status === "CLOSED"
        );
    };

    /* =========================
       Provider
    ========================= */

    return (
        <AcademicYearContext.Provider
            value={{
                academicYear,
                setAcademicYear,
                availableYears,
                closeYear,
                isYearClosed,
            }}
        >
            {children}
        </AcademicYearContext.Provider>
    );
}

/* =========================
   Hook
========================= */

export function useAcademicYear() {
    const ctx = useContext(AcademicYearContext);
    if (!ctx) {
        throw new Error(
            "useAcademicYear must be used within AcademicYearProvider"
        );
    }
    return ctx;
}

/* =========================
   Constants
========================= */

export const CURRENT_YEAR = CURRENT_ACADEMIC_YEAR;
