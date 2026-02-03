import { createContext, useContext, useEffect } from "react";
import type { Class as SchoolClass } from "../types/Class";
import { usePersistentState } from "../hooks/UsePersistentState";

const FIXED_CLASSES = [
  "Playgroup",
  "Nursery",
  "LKG",
  "UKG",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];

type ClassContextType = {
  classes: SchoolClass[];
  addClass: (newClass: SchoolClass) => void;
};



const ClassContext = createContext<ClassContextType | null>(null);

export function ClassProvider({ children }: { children: React.ReactNode }) {
  const [classes, setClasses] = usePersistentState<SchoolClass[]>("classes", []);

  const addClass = (newClass: SchoolClass) => {
    setClasses((prev) => [...prev, newClass]);
  };

  useEffect(() => {
    setClasses(prev => {
      const existingNames = new Set(
        prev.map(c => c.ClassName)
      );

      const missing = FIXED_CLASSES
        .filter(name => !existingNames.has(name))
        .map(name => ({
          id: crypto.randomUUID(),
          ClassName: name,
        }));

      if (missing.length === 0) return prev;

      return [...prev, ...missing];
    });
  }, []);


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
