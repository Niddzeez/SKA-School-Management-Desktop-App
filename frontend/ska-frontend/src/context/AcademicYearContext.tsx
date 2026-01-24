import { createContext, useContext, useState } from "react";
import { usePersistentState } from "../hooks/UsePersistentState";

/* =========================
   Types
========================= */

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
   Provider
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

export function AcademicYearProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [academicYear, setAcademicYear] = usePersistentState<string>(
        "academicYear",
        CURRENT_ACADEMIC_YEAR
    );

    // You can later generate this dynamically
    const [availableYears] = useState<string[]>([
        "2025-26",
        "2026-27",
        "2027-28",
    ]);

    // UI-only "closed year" tracking
    const [closedYears, setClosedYears] = useState<string[]>([]);

    const closeYear = (year: string) => {
        setClosedYears((prev) =>
            prev.includes(year) ? prev : [...prev, year]
        );
    };

    const isYearClosed = (year: string) => {
        return closedYears.includes(year);
    };


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
   Constants (optional export)
========================= */

export const CURRENT_YEAR = CURRENT_ACADEMIC_YEAR;
