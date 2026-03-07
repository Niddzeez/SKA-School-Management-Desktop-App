import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Teacher, CurrentStatus } from "../types/Teachers";
import { apiClient } from "../services/apiClient";

type TeacherContextType = {
  teachers: Teacher[];
  loading: boolean;
  error: string | null;

  addTeacher: (teacher: Omit<Teacher, "id">) => Promise<void>;
  updateTeacherStatus: (
    id: string,
    status: CurrentStatus
  ) => Promise<void>;
};

const TeacherContext =
  createContext<TeacherContextType | null>(null);

export function TeacherProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* 🔹 INITIAL LOAD */
  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const data = await apiClient.get<Teacher[]>("/api/teachers");
        setTeachers(data);
      } catch (err: any) {
        setError(err.message || "Unable to load teachers");
      } finally {
        setLoading(false);
      }
    };

    loadTeachers();
  }, []);

  /* 🔹 CREATE TEACHER */
  const addTeacher = async (
    teacher: Omit<Teacher, "id">
  ) => {
    try {
      const created = await apiClient.post<Teacher>("/api/teachers", teacher);
      setTeachers((prev) => [...prev, created]);
    } catch (err: any) {
      throw new Error(err.message || "Failed to create teacher");
    }
  };

  /* 🔹 UPDATE STATUS */
  const updateTeacherStatus = async (
    id: string,
    status: CurrentStatus
  ) => {
    try {
      const updated = await apiClient.patch<Teacher>(
        `/api/teachers/${id}/status`,
        { status }
      );
      setTeachers((prev) =>
        prev.map((t) => (t.id === id ? updated : t))
      );
    } catch (err: any) {
      throw new Error(err.message || "Failed to update teacher status");
    }
  };

  return (
    <TeacherContext.Provider
      value={{
        teachers,
        loading,
        error,
        addTeacher,
        updateTeacherStatus,
      }}
    >
      {children}
    </TeacherContext.Provider>
  );
}

export function useTeachers() {
  const context = useContext(TeacherContext);
  if (!context) {
    throw new Error(
      "useTeachers must be used within TeacherProvider"
    );
  }
  return context;
}
