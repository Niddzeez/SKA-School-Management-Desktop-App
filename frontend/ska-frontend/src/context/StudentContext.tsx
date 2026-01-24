import { createContext, useContext, useState } from "react";
import type { Student, StudentStatus } from "../types/Student";
import { usePersistentState } from "../hooks/UsePersistentState";

type StudentContextType = {
  students: Student[];
  addStudent: (student: Student) => void;
  UpdateStudentStatus: (id: string, status: StudentStatus) => void;
  assignStudenttoSection: (studentID: string, classID: string, sectionID: string) => void;
};

const StudentContext = createContext<StudentContextType | null>(null);

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] =
    usePersistentState<Student[]>("students", []);
  console.log("StudentContext mounted, students:", students);

  const addStudent = (student: Student) => {
    setStudents((prev) => [...prev, student]);
  };

  const updateStudentStatus = (id: string, status: StudentStatus) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === id
          ? { ...student, status }
          : student
      )
    );
  };


  const assignStudenttoSection = (
    studentId: string,
    classID: string,
    sectionID: string
  ) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id == studentId
          ? { ...student, classID, sectionID }
          : student
      )
    );


  };

  return (
    <StudentContext.Provider value={{ students, addStudent, UpdateStudentStatus: updateStudentStatus, assignStudenttoSection }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudents() {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error("useStudents must be used within StudentProvider");
  }
  return context;
}
