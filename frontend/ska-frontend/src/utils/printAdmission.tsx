import ReactDOM from "react-dom/client";
import AdmissionPrintView from "./admissionpdf";
import type { Student } from "../types/Student";

export function printAdmission(student: Student, academicYear: string) {
    const originalTitle = document.title;

    const printRoot = document.createElement("div");
    document.body.appendChild(printRoot);

    document.title = `Admission_${student.firstName}_${student.lastName}`;

    const root = ReactDOM.createRoot(printRoot);

    root.render(
        <AdmissionPrintView
            student={student}
            academicYear={academicYear}
        />
    );

    // Wait until browser paints the DOM
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            window.print();

            document.title = originalTitle;

            root.unmount();
            document.body.removeChild(printRoot);
        });
    });
}