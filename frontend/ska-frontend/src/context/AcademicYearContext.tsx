import { createContext, useContext, useState } from "react";
import {usePersistentState} from "../hooks/UsePersistentState";

/* =========================
   Types
========================= */

type AcademicYearStatus = "OPEN" | "CLOSED";

type AcademicYearMeta = {
  year: string;
  status: AcademicYearStatus;
  closedAt?: string;
};

type PromotionSummary = {
  promotedCount: number;
  alumniCount: number;
  promotedAt: string;
};

type PromotionSummaryMap = Record<string, PromotionSummary>;
type PromotionLockMap = Record<string, boolean>;

type AutoPromotionRequest = {
  year: string;
  requestedAt: string;
};

type AcademicYearContextType = {
  academicYear: string;
  setAcademicYear: (year: string) => void;

  availableYears: string[];

  closeYear: (year: string) => void;
  isYearClosed: (year: string) => boolean;

  // Promotion system
  isPromotionLocked: (year: string) => boolean;
  lockPromotion: (year: string) => void;

  getPromotionSummary: (
    year: string
  ) => PromotionSummary | undefined;
  setPromotionSummaryForYear: (
    year: string,
    summary: PromotionSummary
  ) => void;

  // Auto promotion bridge
  autoPromotionRequest: AutoPromotionRequest | null;
  requestAutoPromotion: (year: string) => void;
  clearAutoPromotionRequest: () => void;
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

  return month >= 3
    ? `${year}-${String(year + 1).slice(-2)}`
    : `${year - 1}-${String(year).slice(-2)}`;
}

const CURRENT_YEAR = getCurrentAcademicYear();

/* =========================
   Provider
========================= */

export function AcademicYearProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const CURRENT_YEAR = getCurrentAcademicYear();

  /* -------------------------
     Academic year state
  ------------------------- */

  const [academicYear, setAcademicYear] =
    usePersistentState<string>(
      "academicYear",
      CURRENT_YEAR
    );

  const [availableYears] = useState<string[]>([
    "2025-26",
    "2026-27",
    "2027-28",
  ]);

  const [yearMeta, setYearMeta] =
    usePersistentState<AcademicYearMeta[]>(
      "academicYearMeta",
      availableYears.map((year) => ({
        year,
        status: "OPEN",
      }))
    );

  /* -------------------------
     Promotion persistence
  ------------------------- */

  const [promotionLocked, setPromotionLocked] =
    usePersistentState<PromotionLockMap>(
      "promotionLocked",
      {}
    );

  const [promotionSummary, setPromotionSummary] =
    usePersistentState<PromotionSummaryMap>(
      "promotionSummary",
      {}
    );

  const [autoPromotionRequest, setAutoPromotionRequest] =
    usePersistentState<AutoPromotionRequest | null>(
      "autoPromotionRequest",
      null
    );

  /* -------------------------
     Promotion helpers
  ------------------------- */

  const isPromotionLocked = (year: string) =>
    promotionLocked[year] === true;

  const lockPromotion = (year: string) => {
    setPromotionLocked((prev) => ({
      ...prev,
      [year]: true,
    }));
  };

  const setPromotionSummaryForYear = (
    year: string,
    summary: PromotionSummary
  ) => {
    setPromotionSummary((prev) => ({
      ...prev,
      [year]: summary,
    }));
  };

  const getPromotionSummary = (year: string) =>
    promotionSummary[year];

  const requestAutoPromotion = (year: string) => {
    setAutoPromotionRequest({
      year,
      requestedAt: new Date().toISOString(),
    });
  };

  const clearAutoPromotionRequest = () => {
    setAutoPromotionRequest(null);
  };

  /* -------------------------
     Year actions
  ------------------------- */

  const closeYear = (year: string) => {
    if (!isPromotionLocked(year)) {
      const ok = window.confirm(
        "Closing the academic year will automatically promote students and mark Class 10 as Alumni.\n\nProceed?"
      );
      if (!ok) return;

      requestAutoPromotion(year);
    }

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

  const isYearClosed = (year: string) =>
    yearMeta.find((y) => y.year === year)?.status ===
    "CLOSED";

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

        isPromotionLocked,
        lockPromotion,
        getPromotionSummary,
        setPromotionSummaryForYear,

        autoPromotionRequest,
        requestAutoPromotion,
        clearAutoPromotionRequest,
      }}
    >
      {children}
    </AcademicYearContext.Provider>
  );
}


export { CURRENT_YEAR };

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
