import { createContext, useContext, useEffect, useState, useRef } from "react";
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
  isPromotionLocked: boolean;
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
  getActiveYearLabel: () => string | null;
  isPromotionLocked: (year: string) => boolean;
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

  const loadingRef = useRef(false);

  const loadYears = async () => {
    if (loadingRef.current || academicYears.length > 0) return;

    loadingRef.current = true;
    try {
      setLoading(true);

      const raw = await apiClient.get<{
        id: string;
        year: string;
        startDate: string;
        endDate: string;
        status: string;
      }[]>("/api/academic-years");

      const data: AcademicYear[] = raw.map((y) => ({
        id: y.id,
        name: y.year,                  // map backend → frontend
        startDate: y.startDate,
        endDate: y.endDate,
        isClosed: y.status === "CLOSED",
        isPromotionLocked: false
      }));

      setAcademicYears(data);

      const today = new Date();

      const current = data.find((y) => {
        const start = new Date(y.startDate);
        const end = new Date(y.endDate);
        return today >= start && today <= end;
      });

      const next = data
        .filter((y) => new Date(y.startDate) > today)
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];

      setActiveYearState(current ?? next ?? data[0]);

    } catch (err: any) {
      setError(err.message || "Failed to load academic years");
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    if (academicYears.length === 0) {
      loadYears();
    }
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

      const data = await apiClient.get<AcademicYear[]>("/api/academic-years");

      setAcademicYears(data);

      setActiveYearState((current) => {
        if (!current || current.id === yearId) {
          return data.find((y) => !y.isClosed) || data[0] || null;
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

  const getActiveYearLabel = (): string | null => {
    return activeYear?.name ?? null;
  };

  /* -------------------------
     Legacy Promotion Stubs
  ------------------------- */
  // Minimal empty state implementations for UI components that haven't been migrated off yet


  const isPromotionLocked = (year: string) => {
    return academicYears.find((y) => y.id === year)?.isPromotionLocked === true;
  };


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
        getActiveYearLabel,
        isPromotionLocked,
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
