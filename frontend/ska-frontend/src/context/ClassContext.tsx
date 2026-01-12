import { createContext, useContext, useState } from "react";
import type { Class as SchoolClass } from "../types/Class";

type ClassContextType = {
  classes: SchoolClass[];
  addClass: (newClass: SchoolClass) => void;
};

const ClassContext = createContext<ClassContextType | null>(null);

export function ClassProvider({ children }: { children: React.ReactNode }) {
  const [classes, setClasses] = useState<SchoolClass[]>([]);

  const addClass = (newClass: SchoolClass) => {
    setClasses((prev) => [...prev, newClass]);
  };

  return (
    <ClassContext.Provider value={{ classes, addClass }}>
      {children}
    </ClassContext.Provider>
  );
}

export function useClasses() {
  const context = useContext(ClassContext);
  if (!context) {
    throw new Error("useClasses must be used within ClassProvider");
  }
  return context;
}
