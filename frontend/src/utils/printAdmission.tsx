import ReactDOM from "react-dom/client";
import AdmissionPrintView from "./admissionpdf";
import type { Student } from "../types/Student";
import html2pdf from "html2pdf.js";

export async function printAdmission(student: Student, academicYear: string) {
    try {
        const printRoot = document.createElement("div");

        printRoot.style.position = "fixed";
        printRoot.style.top = "0";
        printRoot.style.left = "0";
        printRoot.style.width = "210mm";
        printRoot.style.zIndex = "-9999";
        printRoot.style.background = "white";

        document.body.appendChild(printRoot);

        const root = ReactDOM.createRoot(printRoot);

        root.render(
            <AdmissionPrintView
                student={student}
                academicYear={academicYear}
            />
        );

        await new Promise((resolve) => setTimeout(resolve, 800));

        const filename = `Admission_${student.firstName}_${student.lastName}_${academicYear}.pdf`;
        const target = (printRoot.firstElementChild as HTMLElement) || printRoot;

    
        await html2pdf()
            .set({
                margin: 10,
                filename,
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
            })
            .from(target)
            .save();

        root.unmount();
        document.body.removeChild(printRoot);

    } catch (err) {
        console.error("printAdmission failed:", err);
        alert("Failed to generate PDF. Check console for details.");
    }
}