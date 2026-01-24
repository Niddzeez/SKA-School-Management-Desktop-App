import { createContext, useContext} from "react";
import type { Class as SchoolClass } from "../types/Class";
import { usePersistentState } from "../hooks/UsePersistentState";

type ClassContextType = {
  classes: SchoolClass[];
  addClass: (newClass: SchoolClass) => void;
};

const ClassContext = createContext<ClassContextType | null>(null);

export function ClassProvider({ children }: { children: React.ReactNode }) {
  const [classes, setClasses] = usePersistentState<SchoolClass[]>("classes",[]);

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
