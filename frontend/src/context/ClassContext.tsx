import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Class as SchoolClass } from "../types/Class";
import { apiClient } from "../services/apiClient";

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
  loading: boolean;
  error: string | null;
  addClass: (className: string) => Promise<void>;
};

const ClassContext =
  createContext<ClassContextType | null>(null);

export function ClassProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* 🔹 LOAD CLASSES FROM BACKEND */
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const data = await apiClient.get<SchoolClass[]>("/api/classes");
        setClasses(data);
      } catch (err: any) {
        setError(err.message || "Unable to load classes");
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, []);

  /* 🔹 ORDERED VIEW (UI CONCERN ONLY) */
  const orderedClasses = [...classes].sort((a, b) => {
    const orderA = ORDER_MAP.get(a.ClassName) ?? 999;
    const orderB = ORDER_MAP.get(b.ClassName) ?? 999;
    return orderA - orderB;
  });

  /* 🔹 CREATE CLASS */
  const addClass = async (className: string) => {
    try {
      const created = await apiClient.post<SchoolClass>("/api/classes", { ClassName: className });
      setClasses((prev) => [...prev, created]);
    } catch (err: any) {
      throw new Error(err.message || "Failed to create class");
    }
  };

  return (
    <ClassContext.Provider
      value={{
        classes,
        orderedClasses,
        loading,
        error,
        addClass,
      }}
    >
      {children}
    </ClassContext.Provider>
  );
}

export function useClasses() {
  const context = useContext(ClassContext);
  if (!context) {
    throw new Error(
      "useClasses must be used within ClassProvider"
    );
  }
  return context;
}
