import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Section } from "../types/Section";
import { API_BASE_URL } from "../config/api";

type SectionContextType = {
  sections: Section[];
  loading: boolean;
  error: string | null;

  loadAllSections: () => Promise<void>;
  addSection: (
    classID: string,
    name: string
  ) => Promise<void>;
  assignClassTeacher: (
    sectionId: string,
    teacherId: string
  ) => Promise<void>;
};

const SectionContext =
  createContext<SectionContextType | null>(null);

const BASE_URL = API_BASE_URL;

export function SectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* 🔹 LOAD SECTIONS FOR A CLASS */
  const loadAllSections = async () => {
  setLoading(true);
  setError(null);

  try {
    const res = await fetch(`${BASE_URL}/api/sections`);
    if (!res.ok) throw new Error("Failed to fetch sections");

    const data = await res.json();
    setSections(data);
  } catch (err) {
    setError("Unable to load sections");
  } finally {
    setLoading(false);
  }
};

useEffect(()=>{
  loadAllSections();
},[]);

  /* 🔹 CREATE SECTION */
  const addSection = async (
    classID: string,
    name: string
  ) => {
    const res = await fetch(`${BASE_URL}/api/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classID, name }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to create section");
    }


    const created = await res.json();
    setSections((prev) => [...prev, created]);
  };

  /* 🔹 ASSIGN CLASS TEACHER */
  const assignClassTeacher = async (
    sectionId: string,
    teacherId: string
  ) => {
    const res = await fetch(
      `${BASE_URL}/api/sections/${sectionId}/teacher`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classTeacherID: teacherId,
        }),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to assign class teacher");
    }

    const updated = await res.json();
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? updated : s
      )
    );
  };

  return (
    <SectionContext.Provider
      value={{
        sections,
        loading,
        error,
        loadAllSections,
        addSection,
        assignClassTeacher,
      }}
    >
      {children}
    </SectionContext.Provider>
  );
}

export function useSections() {
  const context = useContext(SectionContext);
  if (!context) {
    throw new Error(
      "useSections must be used within SectionProvider"
    );
  }
  return context;
}
