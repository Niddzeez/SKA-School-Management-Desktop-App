import { useState } from "react";
import { useStudents } from "../../context/StudentContext";
import { useClasses } from "../../context/ClassContext";
import { useAcademicYear } from "../../context/AcademicYearContext";
import "./BulkPromotion.css";

/* =========================
   School Promotion Order
   (Stops at 10th)
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

/* =========================
   Helpers
========================= */

function getNextAcademicYear(year: string): string {
    const [start, end] = year.split("-").map(Number);
    return `${start + 1}-${String(end + 1).padStart(2, "0")}`;
}

function BulkPromotion() {
    const { students, updateStudent } = useStudents();
    const { classes } = useClasses();
    const { academicYear, isPromotionLocked, lockPromotion, getPromotionSummary, setPromotionSummaryForYear
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

        // Not a school class OR already in 10th
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
       Bulk Promotion
    ========================= */



    const handlePromotion = () => {

        if (isPromotionLocked(fromAcademicYear)) {
            alert(
                "Bulk promotion has already been completed for this academic year."
            );
            return;
        }

        const nextAcademicYear =
            getNextAcademicYear(fromAcademicYear);

        let promoted = 0;
        let alumniMarked = 0;

        students.forEach((student) => {
            if (!student.id) return;
            if (student.status !== "Active") return;
            if (!student.classID) return;

            const nextClassID = getNextClassID(
                student.classID
            );

            // 🎓 Completed Class 10 → Alumni
            if (nextClassID === null) {
                updateStudent(student.id, {
                    status: "Alumni",
                });
                alumniMarked++;
                return;
            }

            // Promote student
            updateStudent(student.id, {
                classID: nextClassID,
                sectionID: "", // reset section
            });

            promoted++;
        });

        setPromotionSummaryForYear(fromAcademicYear, {
            promotedCount: promoted,
            alumniCount: alumniMarked,
            promotedAt: new Date().toISOString(),
        });

        lockPromotion(fromAcademicYear);

        alert(
            `Bulk Promotion Completed\n\n` +
            `Promoted Students: ${promoted}\n` +
            `Marked as Alumni (Class 10 passed): ${alumniMarked}\n` +
            `New Academic Year: ${nextAcademicYear}`
        );


    };

    /* =========================
       Render
    ========================= */

    return (
        <div className="page-container">
            <h1>Bulk Promotion</h1>


            {/* Promotion Summary */}
            {summary && (
                <div className="summary-box">
                    <h3>Promotion Summary</h3>
                    <p>
                        <strong>Promoted Students:</strong>{" "}
                        {summary.promotedCount}
                    </p>
                    <p>
                        <strong>Alumni (Class 10 passed):</strong>{" "}
                        {summary.alumniCount}
                    </p>
                    <p>
                        <strong>Promotion Date:</strong>{" "}
                        {new Date(
                            summary.promotedAt
                        ).toLocaleString()}
                    </p>
                </div>
            )}

            <div className="promotion-info">
                <p>
                    Promoting students from{" "}
                    <strong>{fromAcademicYear}</strong> to{" "}
                    <strong>
                        {getNextAcademicYear(fromAcademicYear)}
                    </strong>
                </p>

                <p className="warning">
                    Students completing Class 10 will be marked
                    as <strong>Alumni</strong>.
                </p>

                <p className="note">
                    Classes 11 and 12 are treated as a separate
                    academic flow and are not auto-promoted.
                </p>
            </div>



            <button
                className="danger"
                onClick={handlePromotion}
                disabled={isPromotionLocked(fromAcademicYear)}
            >
                Promote All Eligible Students
            </button>
            {isPromotionLocked(fromAcademicYear) && (
                <p className="note">
                    Promotion already completed for this academic year.
                </p>
            )}

        </div>
    );
}

export default BulkPromotion;
