import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { FeeStructure, FeeComponent } from "../types/ClassFeeStructure";
import { apiClient } from "../services/apiClient";
import { useAcademicYear } from "./AcademicYearContext";

type FeeStructureContextType = {
  feeStructures: FeeStructure[];
  loading: boolean;
  error: string | null;

  createFeeStructure: (classId: string, academicSessionId: string) => Promise<FeeStructure>;
  addFeeComponent: (
    feeStructureID: string,
    component: Omit<FeeComponent, 'id'>
  ) => Promise<void>;
  activateFeeStructure: (feeStructureID: string) => Promise<void>;
  removeFeeComponent: (
    feeStructureID: string,
    componentID: string
  ) => Promise<void>;
  getActiveFeeStructure: (
    classId: string,
    academicSessionId: string
  ) => FeeStructure | undefined;
};

const FeeStructureContext = createContext<FeeStructureContextType | null>(null);

export function FeeStructureProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { activeYear } = useAcademicYear();

  /* -------------------------
     LOAD DATA
  ------------------------- */
  const loadFeeStructures = async () => {
    if (!activeYear?.id) return;

    try {
      if (feeStructures.length === 0) setLoading(true);
      setError(null);

      const data = await apiClient.get<FeeStructure[]>(
        `/api/fee-structures?sessionId=${activeYear.id}`
      );

      setFeeStructures(data);
    } catch (err: any) {
      setError(err.message || "Failed to load fee structures");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeeStructures();
  }, [activeYear?.id]);

  /* -------------------------
     CREATE
  ------------------------- */
  const createFeeStructure = async (classId: string, academicSessionId: string): Promise<FeeStructure> => {
    try {
      setError(null);
      const created = await apiClient.post<FeeStructure>("/api/fee-structures", {
        classId,
        academicSessionId,
      });
      setFeeStructures((prev) => [...prev, created]);
      return created;
    } catch (err: any) {
      setError(err.message || "Failed to create fee structure");
      throw err;
    }
  };

  /* -------------------------
     ACTIVATE
  ------------------------- */
  const activateFeeStructure = async (feeStructureID: string): Promise<void> => {
    try {
      await apiClient.post(`/api/fee-structures/${feeStructureID}/activate`);
      // Reload from backend to assure integrity 
      await loadFeeStructures();
    } catch (err: any) {
      setError(err.message || "Failed to activate fee structure");
      throw err;
    }
  };

  /* -------------------------
     ACTIVE SELECTOR (Offline)
  ------------------------- */
  const getActiveFeeStructure = useCallback(
    (classId: string, academicSessionId: string) => {
      return feeStructures.find(
        fs =>
          fs.classId === classId &&
          fs.academicSessionId === academicSessionId &&
          fs.status === "ACTIVE"
      );
    },
    [feeStructures]
  );

  /* -------------------------
     COMPOsNENTS
  ------------------------- */
  const addFeeComponent = async (
    feeStructureID: string,
    component: Omit<FeeComponent, 'id'>
  ): Promise<void> => {
    const target = feeStructures.find((fs) => fs.id === feeStructureID);
    if (!target) {
      throw new Error("Fee structure not found");
    }
    if (target.status !== "DRAFT") {
      throw new Error("Cannot modify an active fee structure");
    }

    try {
      const updated = await apiClient.post<FeeStructure>(
        `/api/fee-structures/${feeStructureID}/components`,
        component
      );

      setFeeStructures(prev =>
        prev.map(fs =>
          fs.id === feeStructureID ? updated : fs
        )
      );
    } catch (err: any) {
      setError(err.message || "Failed to add fee component");
      throw err;
    }
  };

  const removeFeeComponent = async (
    feeStructureID: string,
    componentID: string
  ): Promise<void> => {
    const target = feeStructures.find((fs) => fs.id === feeStructureID);
    if (!target) {
      throw new Error("Fee structure not found");
    }
    if (target.status !== "DRAFT") {
      throw new Error("Cannot modify an active fee structure");
    }

    try {
      await apiClient.delete(`/api/fee-structures/${feeStructureID}/components/${componentID}`);
      await loadFeeStructures();

      setFeeStructures((prev) =>
        prev.map((fs) =>
          fs.id === feeStructureID
            ? {
              ...fs,
              components: fs.components.filter((c) => c.id !== componentID),
            }
            : fs
        )
      );
    } catch (err: any) {
      setError(err.message || "Failed to remove fee component");
      throw err;
    }
  };

  return (
    <FeeStructureContext.Provider
      value={{
        feeStructures,
        loading,
        error,
        createFeeStructure,
        addFeeComponent,
        activateFeeStructure,
        removeFeeComponent,
        getActiveFeeStructure,
      }}
    >
      {children}
    </FeeStructureContext.Provider>
  );
}

export function useFeeStructures() {
  const ctx = useContext(FeeStructureContext);
  if (!ctx) {
    throw new Error(
      "useFeeStructures must be used inside FeeStructureProvider"
    );
  }
  return ctx;
}
