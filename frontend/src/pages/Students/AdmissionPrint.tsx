import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import AdmissionPrintView from "../../utils/AdmissionPrintView";
import { useAcademicYear } from "../../context/AcademicYearContext";

export default function AdmissionPrint() {

  const location = useLocation();
  const navigate = useNavigate();
  const { activeYear } = useAcademicYear();

  const student = location.state?.student;

  useEffect(() => {

    if (!student) {
      navigate("/admissionForm");
      return;
    }

    const originalTitle = document.title;

    document.title =
      `Admission_${student.firstName}_${student.lastName}_${activeYear?.name}`;

    const timer = setTimeout(() => {

      window.print();

      document.title = originalTitle;

    }, 300);

    return () => clearTimeout(timer);

  }, [student, activeYear, navigate]);

  if (!student) return null;

  return (
    <>
      <div className="print-controls">

        <button
          onClick={() => {

            const originalTitle = document.title;

            document.title =
              `Admission_${student.firstName}_${student.lastName}_${activeYear?.name ?? ""}`;

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
        academicYear={activeYear?.name ?? ""}
      />
    </>
  );
}