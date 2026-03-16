import { createContext, useContext } from "react";
import type { FeeStructure, FeeComponent } from "../types/ClassFeeStructure";
import { usePersistentState } from "../hooks/UsePersistentState";

type FeeStructureContextType = {
  feeStructures: FeeStructure[];
  createFeeStructure: (classID: string, academicYear: string) => void;
  addFeeComponent: (feeStructureID: string, component: FeeComponent) => void;
  activateFeeStructure: (feeStructureID: string) => void;
  removeFeeComponent: (feeStructureID: string, componentID: string) => void;
  getActiveFeeStructure: (classID: string, academicYear: string) => FeeStructure | undefined;
};

const FeeStructureContext = createContext<FeeStructureContextType | null>(null);

/* ─────────────────────────────────────────────
   normaliseYear — converts ANY format the user
   might have typed/selected into the canonical
   short form used everywhere else, e.g:
     "2025-2026"   → "2025-26"
     "2025 - 2026" → "2025-26"
     "2025-26"     → "2025-26"   (already fine)
───────────────────────────────────────────── */
function normaliseYear(raw: string): string {
  const trimmed = raw.replace(/\s/g, ""); // strip spaces
  // Already short: "2025-26"
  if (/^\d{4}-\d{2}$/.test(trimmed)) return trimmed;
  // Long form: "2025-2026"
  const match = trimmed.match(/^(\d{4})-(\d{4})$/);
  if (match) return `${match[1]}-${match[2].slice(-2)}`;
  // Fallback — return as-is
  return trimmed;
}

export function FeeStructureProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [feeStructures, setFeeStructures] = usePersistentState<FeeStructure[]>(
    "feeStructures",
    []
  );

  const createFeeStructure = (classID: string, academicYear: string) => {
    const year = normaliseYear(academicYear);
    // Prevent duplicate draft for same class + year
    const exists = feeStructures.find(
      (fs) => fs.classID === classID && fs.academicYear === year
    );
    if (exists) return;

    setFeeStructures((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        classID,
        academicYear: year,       // ← always normalised
        components: [],
        status: "DRAFT",
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const activateFeeStructure = (feeStructureID: string) => {
    setFeeStructures((prev) => {
      const target = prev.find((f) => f.id === feeStructureID);
      if (!target) return prev;

      return prev.map((fs) => {
        if (
          fs.classID      === target.classID &&
          fs.academicYear === target.academicYear
        ) {
          return fs.id === feeStructureID
            ? { ...fs, status: "ACTIVE" }
            : { ...fs, status: "DRAFT" };
        }
        return fs;
      });
    });
  };

  const getActiveFeeStructure = (classID: string, academicYear: string) => {
    const year = normaliseYear(academicYear);   // ← normalise before lookup
    return feeStructures.find(
      (fs) =>
        fs.classID      === classID &&
        fs.academicYear === year    &&
        fs.status       === "ACTIVE"
    );
  };

  const addFeeComponent = (feeStructureID: string, component: FeeComponent) => {
    setFeeStructures((prev) =>
      prev.map((fs) =>
        fs.id === feeStructureID
          ? { ...fs, components: [...fs.components, component] }
          : fs
      )
    );
  };

  const removeFeeComponent = (feeStructureID: string, componentID: string) => {
    setFeeStructures((prev) =>
      prev.map((fs) =>
        fs.id === feeStructureID && fs.status === "DRAFT"
          ? { ...fs, components: fs.components.filter((c) => c.id !== componentID) }
          : fs
      )
    );
  };

  return (
    <FeeStructureContext.Provider
      value={{
        feeStructures,
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
    throw new Error("useFeeStructures must be used inside FeeStructureProvider");
  }
  return ctx;
}