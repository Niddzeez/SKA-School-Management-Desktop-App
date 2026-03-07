import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Section } from "../types/Section";
import { apiClient } from "../services/apiClient";

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
      const data = await apiClient.get<Section[]>("/api/sections");
      setSections(data);
    } catch (err: any) {
      setError(err.message || "Unable to load sections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllSections();
  }, []);

  /* 🔹 CREATE SECTION */
  const addSection = async (
    classID: string,
    name: string
  ) => {
    try {
      const created = await apiClient.post<Section>("/api/sections", { classID, name });
      setSections((prev) => [...prev, created]);
    } catch (err: any) {
      throw new Error(err.message || "Failed to create section");
    }
  };

  /* 🔹 ASSIGN CLASS TEACHER */
  const assignClassTeacher = async (
    sectionId: string,
    teacherId: string
  ) => {
    try {
      const updated = await apiClient.patch<Section>(
        `/api/sections/${sectionId}/teacher`,
        { classTeacherID: teacherId }
      );
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId ? updated : s
        )
      );
    } catch (err: any) {
      throw new Error(err.message || "Failed to assign class teacher");
    }
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
