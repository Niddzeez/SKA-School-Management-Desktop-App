import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Student, StudentStatus } from "../types/Student";
import { API_BASE_URL } from "../config/api";

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

const BASE_URL = API_BASE_URL;

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
        const res = await fetch(`${BASE_URL}/api/students`);
        if (!res.ok) throw new Error("Failed to fetch students");

        const data = await res.json();
        setStudents(data);
      } catch (err) {
        setError("Unable to load students");
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  const addStudent = async (
  student: Omit<Student, "id">
): Promise<Student> => {
  const res = await fetch(`${BASE_URL}/api/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(student),
  });

  if (!res.ok) {
    throw new Error("Failed to create student");
  }

  const created = await res.json();
  setStudents((prev) => [...prev, created]);
  return created;
};


  /* 🔹 UPDATE STATUS */
  const UpdateStudentStatus = async (
    id: string,
    status: StudentStatus
  ) => {
    const res = await fetch(
      `${BASE_URL}/api/students/${id}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to update status");
    }

    const updated = await res.json();
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? updated : s))
    );
  };

  const getStudentById = async (id: string): Promise<Student> => {
  const res = await fetch(`${BASE_URL}/api/students/${id}`);

  if (!res.ok) {
    throw new Error("Failed to fetch student");
  }

  return res.json();
};


  /* 🔹 ASSIGN CLASS + SECTION */
  const assignStudenttoSection = async (
    studentID: string,
    classID: string,
    sectionID: string
  ) => {
    const res = await fetch(
      `${BASE_URL}/api/students/${studentID}/assignment`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classID, sectionID }),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to assign section");
    }

    const updated = await res.json();
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentID ? updated : s
      )
    );
  };

  /* 🔹 GENERIC UPDATE (soft support) */
  const updateStudent = async (
    studentId: string,
    updates: StudentUpdate
  ) => {
    const res = await fetch(
      `${BASE_URL}/api/students/${studentId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to update student");
    }

    const updated = await res.json();
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId ? updated : s
      )
    );
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
