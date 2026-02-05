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

const ORDER_MAP = new Map(
  FIXED_CLASSES.map((name, index) => [name, index])
);


type ClassContextType = {
  classes: SchoolClass[];
  orderedClasses: SchoolClass[];
  addClass: (newClass: SchoolClass) => void;
};



const ClassContext = createContext<ClassContextType | null>(null);

export function ClassProvider({ children }: { children: React.ReactNode }) {
  const [classes, setClasses] = usePersistentState<SchoolClass[]>("classes", []);


  const orderedClasses = [...classes].sort((a, b) => {
    const orderA = ORDER_MAP.get(a.ClassName) ?? 999;
    const orderB = ORDER_MAP.get(b.ClassName) ?? 999;
    return orderA - orderB;
  });




  const addClass = (newClass: SchoolClass) => {
    setClasses((prev) => [...prev, newClass]);
  };

  useEffect(() => {
  setClasses(prev => {
    const map = new Map<string, SchoolClass>();

    // Deduplicate
    prev.forEach(cls => {
      if (!map.has(cls.ClassName)) {
        map.set(cls.ClassName, cls);
      }
    });

    // Ensure all FIXED_CLASSES exist
    FIXED_CLASSES.forEach(name => {
      if (!map.has(name)) {
        map.set(name, {
          id: crypto.randomUUID(),
          ClassName: name,
        });
      }
    });

    // 🔑 RETURN IN FIXED ORDER
    return FIXED_CLASSES
      .map(name => map.get(name))
      .filter(Boolean) as SchoolClass[];
  });
}, []);





  return (
    <ClassContext.Provider value={{ classes, addClass, orderedClasses }}>
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
