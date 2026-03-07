import { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "../services/apiClient";

/* =========================
   Types
========================= */

export type AcademicYear = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isClosed: boolean;
};

// Legacy references (if still needed externally for UI, though logic moved to backend)
type PromotionSummary = {
  promotedCount: number;
  alumniCount: number;
  promotedAt: string;
};

type AutoPromotionRequest = {
  year: string;
  requestedAt: string;
};

type AcademicYearContextType = {
  academicYears: AcademicYear[];
  activeYear: AcademicYear | null;
  loading: boolean;
  error: string | null;
  setActiveYear: (yearId: string) => void;
  closeYear: (yearId: string) => Promise<void>;
  isYearClosed: (yearId: string) => boolean;
  getActiveYearName: () => string | null;

  // Legacy Promotion stubs to prevent immediate breaking changes in dependent files if they still call these
  isPromotionLocked: (year: string) => boolean;
  lockPromotion: (year: string) => void;
  getPromotionSummary: (year: string) => PromotionSummary | undefined;
  setPromotionSummaryForYear: (
    year: string,
    summary: PromotionSummary
  ) => void;
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
   Provider
========================= */

export function AcademicYearProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [activeYear, setActiveYearState] = useState<AcademicYear | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /* -------------------------
     API Loading
  ------------------------- */

  const loadYears = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<AcademicYear[]>("/api/academic-years");
      setAcademicYears(data);

      if (data.length > 0) {
        setActiveYearState((current) => {
          if (current) return current;
          return data.find((y) => !y.isClosed) || data[0];
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load academic years");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadYears();
  }, []);

  /* -------------------------
     Actions
  ------------------------- */

  const setActiveYear = (yearId: string) => {
    const found = academicYears.find((y) => y.id === yearId);
    if (found) {
      setActiveYearState(found);
    }
  };

  const closeYear = async (yearId: string): Promise<void> => {
    try {
      setError(null);
      await apiClient.post(`/api/academic-years/${yearId}/close`);
      await loadYears();

      setActiveYearState((current) => {
        if (!current || current.id === yearId) {
          const openYear = academicYears.find((y) => !y.isClosed);
          return openYear || academicYears[0] || null;
        }
        return current;
      });
    } catch (err: any) {
      setError(err.message || "Failed to close academic year");
      throw err;
    }
  };

  const isYearClosed = (yearId: string): boolean => {
    return academicYears.find((y) => y.id === yearId)?.isClosed === true;
  };

  const getActiveYearName = (): string | null => {
    return activeYear?.name || null;
  };

  /* -------------------------
     Legacy Promotion Stubs
  ------------------------- */
  // Minimal empty state implementations for UI components that haven't been migrated off yet
  const [promotionLocked, setPromotionLocked] = useState<Record<string, boolean>>({});
  const [promotionSummary, setPromotionSummary] = useState<Record<string, PromotionSummary>>({});
  const [autoPromotionRequest, setAutoPromotionRequest] = useState<AutoPromotionRequest | null>(null);

  const isPromotionLocked = (year: string) => promotionLocked[year] === true;
  const lockPromotion = (year: string) => setPromotionLocked((p) => ({ ...p, [year]: true }));
  const setPromotionSummaryForYear = (year: string, summary: PromotionSummary) => setPromotionSummary((p) => ({ ...p, [year]: summary }));
  const getPromotionSummary = (year: string) => promotionSummary[year];
  const requestAutoPromotion = (year: string) => setAutoPromotionRequest({ year, requestedAt: new Date().toISOString() });
  const clearAutoPromotionRequest = () => setAutoPromotionRequest(null);

  return (
    <AcademicYearContext.Provider
      value={{
        academicYears,
        activeYear,
        loading,
        error,

        setActiveYear,
        closeYear,
        isYearClosed,
        getActiveYearName,

        // Legacy bypasses to avoid crashing depending child components until they're refactored
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
