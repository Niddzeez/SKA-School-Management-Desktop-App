import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import AdmissionPrintView from "../../utils/admissionpdf";
import { useAcademicYear } from "../../context/AcademicYearContext";

export default function AdmissionPrint() {
  const location = useLocation();
  const navigate = useNavigate();
  const { academicYear } = useAcademicYear();

  const student = location.state?.student;

  useEffect(() => {
    if (!student) {
      navigate("/admission");
      return;
    }

    const originalTitle = document.title;

    document.title = `Admission_${student.firstName}_${student.lastName}_${academicYear}`;

    const timer = setTimeout(() => {
      window.print();

      document.title = originalTitle;
    }, 300);

    return () => clearTimeout(timer);
  }, [student, academicYear, navigate]);

  return (
    <>
      {/* 🔁 SCREEN-ONLY CONTROLS */}
      <div className="print-controls">
        <button
          onClick={() => {
            const originalTitle = document.title;
            document.title = `Admission_${student.firstName}_${student.lastName}_${academicYear}`;
            window.print();
            document.title = originalTitle;
          }}
        >
          Re-print
        </button>

        <button onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      <AdmissionPrintView
        student={student}
        academicYear={academicYear}
      />
    </>
  );
}
