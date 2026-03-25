import { renderToString } from "react-dom/server";
import AdmissionPrintView from "./AdmissionPrintView";
import type { Student } from "../types/Student";
import html2pdf from "html2pdf.js";

interface PrintAdmissionOptions {
  student: Student;
  academicYear: string;
  className?: string;   // pass resolved class name, e.g. "10"
  sectionName?: string; // pass resolved section name, e.g. "A"
}

export async function printAdmission(
  studentOrOptions: Student | PrintAdmissionOptions,
  academicYear?: string,
  className?: string,
  sectionName?: string
) {
  // Support both old signature (student, year) and new (options object)
  let student: Student;
  let year: string;
  let resolvedClassName: string | undefined;
  let resolvedSectionName: string | undefined;

  if ("student" in studentOrOptions) {
    // New options object form
    student = studentOrOptions.student;
    year = studentOrOptions.academicYear;
    resolvedClassName = studentOrOptions.className;
    resolvedSectionName = studentOrOptions.sectionName;
  } else {
    // Old positional form: printAdmission(student, year, className, sectionName)
    student = studentOrOptions;
    year = academicYear ?? "";
    resolvedClassName = className;
    resolvedSectionName = sectionName;
  }

  try {
    const html = renderToString(
      <AdmissionPrintView
        student={student}
        academicYear={year}
        className={resolvedClassName}
        sectionName={resolvedSectionName}
      />
    );

    const container = document.createElement("div");
    container.innerHTML = html;

    const filename = `Admission_${student.firstName}_${student.lastName}_${year}.pdf`;

    await html2pdf()
      .set({
        margin: 0,
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: "avoid-all" }
      } as any)
      .from(container)
      .save();
  } catch (err) {
    console.error("printAdmission failed:", err);
  }
}