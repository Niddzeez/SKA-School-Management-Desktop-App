import { createContext, useCallback, useContext, useState } from "react";
import type { FeeStructure, FeeComponent } from "../types/ClassFeeStructure";
import { apiClient } from "../services/apiClient";

type FeeStructureContextType = {
  feeStructures: FeeStructure[];
  loading: boolean;
  error: string | null;

  createFeeStructure: (classId: string, academicSessionId: string) => Promise<FeeStructure>;
  addFeeComponent: (feeStructureID: string, component: Omit<FeeComponent, 'id'>) => Promise<void>;
  activateFeeStructure: (feeStructureID: string) => Promise<void>;
  removeFeeComponent: (feeStructureID: string, componentID: string) => Promise<void>;
  deleteFeeStructure: (feeStructureID: string) => Promise<void>;  // ✅ added
  getActiveFeeStructure: (classId: string, academicSessionId: string) => FeeStructure | undefined;
  loadFeeStructures: (sessionId: string) => Promise<void>;  // ✅ added for manual refresh after actions
};

const FeeStructureContext = createContext<FeeStructureContextType | null>(null);

export function FeeStructureProvider({ children }: { children: React.ReactNode }) {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  const loadFeeStructures = async (sessionId: string) => {
  try {
    setLoading(true);
    setError(null);

    const data = await apiClient.get<FeeStructure[]>(
      `/api/fee-structures?sessionId=${sessionId}`
    );

    setFeeStructures(data);
  } catch (err: any) {
    setError(err.message || "Failed to load fee structures");
  } finally {
    setLoading(false);
  }
};


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

  const activateFeeStructure = async (feeStructureID: string): Promise<void> => {
    try {
      const target = feeStructures.find(fs => fs.id ===feeStructureID);
      await apiClient.post(`/api/fee-structures/${feeStructureID}/activate`);
      if(!target) throw new Error("Fee structure not found");
      await loadFeeStructures(target.academicSessionId);
    } catch (err: any) {
      setError(err.message || "Failed to activate fee structure");
      throw err;
    }
  };

  const getFeeStructureForYear = useCallback(
  (classId: string, academicSessionId: string) => {
    const structures = feeStructures.filter(
      fs =>
        fs.classId === classId &&
        fs.academicSessionId === academicSessionId
    );

    if (structures.length === 0) return undefined;

    // Prefer ACTIVE
    const active = structures.find(fs => fs.status === "ACTIVE");
    if (active) return active;

    // Fallback → latest (or first)
    return structures[0];
  },
  [feeStructures]
);

  const addFeeComponent = async (
    feeStructureID: string,
    component: Omit<FeeComponent, 'id'>
  ): Promise<void> => {
    const target = feeStructures.find((fs) => fs.id === feeStructureID);
    if (!target) throw new Error("Fee structure not found");
    if (target.status !== "DRAFT") throw new Error("Cannot modify an active fee structure");

    try {
      const updated = await apiClient.post<FeeStructure>(
        `/api/fee-structures/${feeStructureID}/components`,
        component
      );
      setFeeStructures(prev =>
        prev.map(fs => fs.id === feeStructureID ? updated : fs)
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
    if (!target) throw new Error("Fee structure not found");
    if (target.status !== "DRAFT") throw new Error("Cannot modify an active fee structure");

    try {
      await apiClient.delete(`/api/fee-structures/${feeStructureID}/components/${componentID}`);
      await loadFeeStructures(target.academicSessionId);
      setFeeStructures((prev) =>
        prev.map((fs) =>
          fs.id === feeStructureID
            ? { ...fs, components: fs.components.filter((c) => c.id !== componentID) }
            : fs
        )
      );
    } catch (err: any) {
      setError(err.message || "Failed to remove fee component");
      throw err;
    }
  };

  /* ── ✅ Delete DRAFT fee structure ── */
  const deleteFeeStructure = async (feeStructureID: string): Promise<void> => {
    const target = feeStructures.find((fs) => fs.id === feeStructureID);
    if (!target) throw new Error("Fee structure not found");
    if (target.status !== "DRAFT") throw new Error("Only DRAFT fee structures can be deleted");

    try {
      await apiClient.delete(`/api/fee-structures/${feeStructureID}`);
      setFeeStructures((prev) => prev.filter((fs) => fs.id !== feeStructureID));
    } catch (err: any) {
      setError(err.message || "Failed to delete fee structure");
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
        deleteFeeStructure,  // ✅ added
        getActiveFeeStructure: getFeeStructureForYear,
        loadFeeStructures,  // ✅ added for manual refresh after actions
      }}
    >
      {children}
    </FeeStructureContext.Provider>
  );
}

export function useFeeStructures() {
  const ctx = useContext(FeeStructureContext);
  if (!ctx) {
    throw new Error("useFeeStructures must be used inside FeeStructureProvider");
  }
  return ctx;
}