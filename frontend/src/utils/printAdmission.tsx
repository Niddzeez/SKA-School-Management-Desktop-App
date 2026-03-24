import ReactDOM from "react-dom/client";
import { renderToString } from "react-dom/server";import AdmissionPrintView from "./AdmissionPrintView"; // 🔥 FIX NAME
import type { Student } from "../types/Student";
import html2pdf from "html2pdf.js";


/* 🔥 WAIT UNTIL DOM ACTUALLY EXISTS */
async function waitForRender(element: HTMLElement) {
  return new Promise<void>((resolve) => {
    const check = () => {
      if (element.innerHTML.trim().length > 0) {
        resolve();
      } else {
        requestAnimationFrame(check);
      }
    };
    check();
  });
}

export async function printAdmission(student: Student, academicYear: string) {
  try {
    // 🔥 Convert React → HTML string
    const html = renderToString(
      <AdmissionPrintView
        student={student}
        academicYear={academicYear}
      />
    );

    // 🔥 Create container (like PrintUtils)
    const container = document.createElement("div");
    container.innerHTML = html;

    const filename = `Admission_${student.firstName}_${student.lastName}_${academicYear}.pdf`;

    await html2pdf()
      .set({
        margin: 10,
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(container)
      .save();

  } catch (err) {
    console.error("printAdmission failed:", err);
  }
}