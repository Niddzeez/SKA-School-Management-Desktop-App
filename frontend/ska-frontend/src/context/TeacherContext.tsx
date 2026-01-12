import { createContext, useContext, useState } from "react";
import type { Teacher, CurrentStatus } from "../types/Teachers";

type TeacherContextType = {
  teachers: Teacher[];
  addTeacher: (teacher: Teacher) => void;
  updateTeacherStatus: (id: string, status: CurrentStatus) => void;
};

const TeacherContext = createContext<TeacherContextType | null>(null);

export function TeacherProvider({ children }: { children: React.ReactNode }) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const addTeacher = (teacher: Teacher) => {
    setTeachers((prev) => [...prev, teacher]);
  };

  const updateTeacherStatus = (id: string, status: CurrentStatus) => {
    setTeachers((prev) =>
      prev.map((teacher) =>
        teacher.id === id
          ? { ...teacher, status }
          : teacher
      )
    );
  };

  return (
    <TeacherContext.Provider
      value={{ teachers, addTeacher, updateTeacherStatus }}
    >
      {children}
    </TeacherContext.Provider>
  );
}

export function useTeachers() {
  const context = useContext(TeacherContext);
  if (!context) {
    throw new Error("useTeachers must be used within TeacherProvider");
  }
  return context;
}
