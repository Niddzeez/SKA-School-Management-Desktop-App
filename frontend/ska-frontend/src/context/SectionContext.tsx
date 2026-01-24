import { createContext, useContext, useState } from "react";
import type { Section } from "../types/Section";
import { usePersistentState } from "../hooks/UsePersistentState";

type SectionContextType = {
  sections: Section[];
  addSection: (section: Section) => void;
  assignClassTeacher: (sectionId: string, teacherId: string) => void;
};

const SectionContext = createContext<SectionContextType | null>(null);

export function SectionProvider({ children }: { children: React.ReactNode }) {
  const [sections, setSections] = usePersistentState<Section[]>("sections", []);

  const addSection = (section: Section) => {
    setSections((prev) => [...prev, section]);
  };

  const assignClassTeacher = (sectionId: string, teacherId: string) => {
    console.log("Assigning teacher", sectionId, teacherId);
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? { ...section, classTeacherID: teacherId }
          : section
      )
    );
  };

  return (
    <SectionContext.Provider
      value={{ sections, addSection, assignClassTeacher }}
    >
      {children}
    </SectionContext.Provider>
  );
}

export function useSections() {
  const context = useContext(SectionContext);
  if (!context) {
    throw new Error("useSections must be used within SectionProvider");
  }
  return context;
}
