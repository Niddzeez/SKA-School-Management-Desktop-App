import { useEffect, useState } from "react";
import { useStudents } from "../../context/StudentContext";
import { useClasses } from "../../context/ClassContext";
import { useAcademicYear } from "../../context/AcademicYearContext";
import { printReport } from "../Reports/Utils/printUtils";
import "./BulkPromotion.css";

/* =========================
   School Promotion Order
========================= */

const SCHOOL_CLASS_ORDER = [
  "Playgroup",
  "Nursery",
  "LKG",
  "UKG",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
];

function getNextAcademicYear(year: string): string {
  const [start, end] = year.split("-").map(Number);
  return `${start + 1}-${String(end + 1).padStart(2, "0")}`;
}

function BulkPromotion() {
  const { students, updateStudent } = useStudents();
  const { classes } = useClasses();
  const {
    academicYear,
    isPromotionLocked,
    lockPromotion,
    getPromotionSummary,
    setPromotionSummaryForYear,
    autoPromotionRequest,
    clearAutoPromotionRequest,
  } = useAcademicYear();

  const [fromAcademicYear] = useState(academicYear);
  const summary = getPromotionSummary(fromAcademicYear);

  /* =========================
     Resolve Next Class
  ========================= */

  const getNextClassID = (
    currentClassID: string
  ): string | null => {
    const currentClass = classes.find(
      (c) => c.id === currentClassID
    );
    if (!currentClass) return null;

    const index = SCHOOL_CLASS_ORDER.indexOf(
      currentClass.ClassName
    );

    if (
      index === -1 ||
      index === SCHOOL_CLASS_ORDER.length - 1
    ) {
      return null;
    }

    const nextClassName =
      SCHOOL_CLASS_ORDER[index + 1];

    const nextClass = classes.find(
      (c) => c.ClassName === nextClassName
    );

    return nextClass?.id ?? null;
  };

  /* =========================
     Promotion Runner
  ========================= */

  const handlePromotion = () => {
    if (isPromotionLocked(fromAcademicYear)) return;

    let promoted = 0;
    let alumni = 0;

    students.forEach((student) => {
      if (!student.id) return;
      if (student.status !== "Active") return;
      if (!student.classID) return;

      const nextClassID = getNextClassID(
        student.classID
      );

      if (nextClassID === null) {
        updateStudent(student.id, {
          status: "Alumni",
        });
        alumni++;
        return;
      }

      updateStudent(student.id, {
        classID: nextClassID,
        sectionID: "",
      });

      promoted++;
    });

    setPromotionSummaryForYear(fromAcademicYear, {
      promotedCount: promoted,
      alumniCount: alumni,
      promotedAt: new Date().toISOString(),
    });

    

    lockPromotion(fromAcademicYear);
  };

  /* =========================
     Auto-run on Year Close
  ========================= */

  useEffect(() => {
    if (
      autoPromotionRequest &&
      autoPromotionRequest.year === fromAcademicYear &&
      !isPromotionLocked(fromAcademicYear)
    ) {
      handlePromotion();
      clearAutoPromotionRequest();
    }
  }, [autoPromotionRequest]);

  /* =========================
     Print Data
  ========================= */

  const printData = summary
    ? {
        title: "Promotion Summary",
        meta: {
          academicYear: fromAcademicYear,
          reportType: "STATEMENT",
          granularity: "YEARLY",
          periodLabel: "Academic Year Promotion",
        },
        sections: [
          {
            title: "Summary",
            headers: ["Metric", "Value"],
            rows: [
              {
                columns: [
                  "Promoted Students",
                  String(summary.promotedCount),
                ],
              },
              {
                columns: [
                  "Alumni (Class 10 Passed)",
                  String(summary.alumniCount),
                ],
              },
              {
                columns: [
                  "Promotion Date",
                  new Date(
                    summary.promotedAt
                  ).toLocaleString(),
                ],
              },
            ],
          },
        ],
      } as const
    : null;

  /* =========================
     Render
  ========================= */

  return (
    <div className="page-container">
      <h1>Bulk Promotion</h1>

      {summary && (
        <div className="summary-box">
          <h3>Promotion Summary</h3>
          <p>
            <strong>Promoted Students:</strong>{" "}
            {summary.promotedCount}
          </p>
          <p>
            <strong>Alumni:</strong>{" "}
            {summary.alumniCount}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(
              summary.promotedAt
            ).toLocaleString()}
          </p>

          {printData && (
            <button
              className="secondary"
              onClick={() =>
                printReport(printData)
              }
            >
              Export Promotion Summary (PDF)
            </button>
          )}
        </div>
      )}

      <button
        className="danger"
        onClick={handlePromotion}
        disabled={isPromotionLocked(fromAcademicYear)}
      >
        Promote All Eligible Students
      </button>

      {isPromotionLocked(fromAcademicYear) && (
        <p className="note">
          Promotion already completed for this academic
          year.
        </p>
      )}
    </div>
  );
}

export default BulkPromotion;
