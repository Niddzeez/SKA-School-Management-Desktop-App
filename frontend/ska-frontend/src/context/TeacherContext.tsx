import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Teacher, CurrentStatus } from "../types/Teachers";
import { API_BASE_URL } from "../config/api";


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

const BASE_URL = API_BASE_URL;

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
        const res = await fetch(`${BASE_URL}/api/teachers`);
        if (!res.ok) throw new Error("Failed to fetch teachers");

        const data = await res.json();
        setTeachers(data);
      } catch (err) {
        setError("Unable to load teachers");
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
    const res = await fetch(`${BASE_URL}/api/teachers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(teacher),
    });

    if (!res.ok) {
      throw new Error("Failed to create teacher");
    }

    const created = await res.json();
    setTeachers((prev) => [...prev, created]);
  };

  /* 🔹 UPDATE STATUS */
  const updateTeacherStatus = async (
    id: string,
    status: CurrentStatus
  ) => {
    const res = await fetch(
      `${BASE_URL}/api/teachers/${id}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to update teacher status");
    }

    const updated = await res.json();
    setTeachers((prev) =>
      prev.map((t) => (t.id === id ? updated : t))
    );
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
