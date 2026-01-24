import { createContext, useContext, useState } from "react";
import type { FeeStructure, FeeComponent } from "../types/ClassFeeStructure";
import { usePersistentState } from "../hooks/UsePersistentState";

type FeeStructureContextType = {
  feeStructures: FeeStructure[];

  createFeeStructure: (classID: string, academicYear: string) => void;
  addFeeComponent: (
    feeStructureID: string,
    component: FeeComponent
  ) => void;
  activateFeeStructure: (feeStructureID: string) => void;
  removeFeeComponent: (feeStructureID: string,
    componentID: string) => void;
  getActiveFeeStructure: (classID: string, academicYear: string) => FeeStructure | undefined;
};

const FeeStructureContext = createContext<FeeStructureContextType | null>(null);

export function FeeStructureProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [feeStructures, setFeeStructures] = usePersistentState<FeeStructure[]>("feeStructures", []);

  const createFeeStructure = (classID: string, academicYear: string) => {
    setFeeStructures((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        classID,
        academicYear,
        components: [],
        status: "DRAFT",
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const activateFeeStructure = (feeStructureID: string) => {
  setFeeStructures(prev =>
    prev.map(fs => {
      const target = prev.find(f => f.id === feeStructureID);
      if (!target) return fs;

      if (
        fs.classID === target.classID &&
        fs.academicYear === target.academicYear
      ) {
        return fs.id === feeStructureID
          ? { ...fs, status: "ACTIVE" }
          : { ...fs, status: "DRAFT" };
      }

      return fs;
    })
  );
};


  const getActiveFeeStructure = (
    classID: string,
    academicYear: string
  ) => {
    return feeStructures.find(
      (fs) =>
        fs.classID === classID &&
        fs.academicYear === academicYear &&
        fs.status === "ACTIVE"
    );
  };



  const addFeeComponent = (
    feeStructureID: string,
    component: FeeComponent
  ) => {
    setFeeStructures((prev) =>
      prev.map((fs) =>
        fs.id === feeStructureID
          ? { ...fs, components: [...fs.components, component] }
          : fs
      )
    );
  };

  const removeFeeComponent = (
    feeStructureID: string,
    componentID: string
  ) => {
    setFeeStructures((prev) =>
      prev.map((fs) =>
        fs.id === feeStructureID && fs.status === "DRAFT"
          ? {
            ...fs,
            components: fs.components.filter(
              (c) => c.id !== componentID
            ),
          }
          : fs
      )
    );
  };


  return (
    <FeeStructureContext.Provider
      value={{ feeStructures, createFeeStructure, addFeeComponent, activateFeeStructure, removeFeeComponent, getActiveFeeStructure}}
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
