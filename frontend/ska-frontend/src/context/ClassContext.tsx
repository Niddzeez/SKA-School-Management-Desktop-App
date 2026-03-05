import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Class as SchoolClass } from "../types/Class";
import { API_BASE_URL } from "../config/api";

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

const BASE_URL = API_BASE_URL;

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
        const res = await fetch(`${BASE_URL}/api/classes`);
        if (!res.ok) throw new Error("Failed to fetch classes");

        const data = await res.json();
        setClasses(data);
      } catch (err) {
        setError("Unable to load classes");
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
    const res = await fetch(`${BASE_URL}/api/classes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ClassName: className }),
    });

    if (!res.ok) {
      throw new Error("Failed to create class");
    }

    const created = await res.json();
    setClasses((prev) => [...prev, created]);
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
