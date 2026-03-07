import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Student, StudentStatus } from "../types/Student";
import { apiClient } from "../services/apiClient";

type StudentUpdate = Partial<Omit<Student, "id">>;

type StudentContextType = {
  students: Student[];
  loading: boolean;
  error: string | null;

  addStudent: (student: Omit<Student, "id">) => Promise<Student>;
  UpdateStudentStatus: (
    id: string,
    status: StudentStatus
  ) => Promise<void>;
  assignStudenttoSection: (
    studentID: string,
    classID: string,
    sectionID: string
  ) => Promise<void>;
  updateStudent: (
    studentId: string,
    updates: StudentUpdate
  ) => Promise<void>;
  getStudentById: (
    id: string
  ) => Promise<Student>;
};

const StudentContext =
  createContext<StudentContextType | null>(null);

export function StudentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* 🔹 INITIAL LOAD */
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const data = await apiClient.get<Student[]>("/api/students");
        setStudents(data);
      } catch (err: any) {
        setError(err.message || "Unable to load students");
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  const addStudent = async (
    student: Omit<Student, "id">
  ): Promise<Student> => {
    try {
      const created = await apiClient.post<Student>("/api/students", student);
      setStudents((prev) => [...prev, created]);
      return created;
    } catch (err: any) {
      throw new Error(err.message || "Failed to create student");
    }
  };

  /* 🔹 UPDATE STATUS */
  const UpdateStudentStatus = async (
    id: string,
    status: StudentStatus
  ) => {
    try {
      const updated = await apiClient.patch<Student>(`/api/students/${id}/status`, { status });
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? updated : s))
      );
    } catch (err: any) {
      throw new Error(err.message || "Failed to update status");
    }
  };

  const getStudentById = async (id: string): Promise<Student> => {
    try {
      return await apiClient.get<Student>(`/api/students/${id}`);
    } catch (err: any) {
      throw new Error(err.message || "Failed to fetch student");
    }
  };

  /* 🔹 ASSIGN CLASS + SECTION */
  const assignStudenttoSection = async (
    studentID: string,
    classID: string,
    sectionID: string
  ) => {
    try {
      const updated = await apiClient.patch<Student>(
        `/api/students/${studentID}/assignment`,
        { classID, sectionID }
      );
      setStudents((prev) =>
        prev.map((s) => (s.id === studentID ? updated : s))
      );
    } catch (err: any) {
      throw new Error(err.message || "Failed to assign section");
    }
  };

  /* 🔹 GENERIC UPDATE (soft support) */
  const updateStudent = async (
    studentId: string,
    updates: StudentUpdate
  ) => {
    try {
      const updated = await apiClient.patch<Student>(
        `/api/students/${studentId}`,
        updates
      );
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? updated : s))
      );
    } catch (err: any) {
      throw new Error(err.message || "Failed to update student");
    }
  };

  return (
    <StudentContext.Provider
      value={{
        students,
        loading,
        error,
        addStudent,
        UpdateStudentStatus,
        assignStudenttoSection,
        updateStudent,
        getStudentById
      }}
    >
      {children}
    </StudentContext.Provider>
  );
}

export function useStudents() {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error(
      "useStudents must be used within StudentProvider"
    );
  }
  return context;
}
