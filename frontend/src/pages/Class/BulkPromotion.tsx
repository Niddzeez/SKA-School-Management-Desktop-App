import { useStudents } from "../../context/StudentContext";
import { useClasses } from "../../context/ClassContext";
import { useAcademicYear } from "../../context/AcademicYearContext";
import { getNextClassId } from "../../utils/promotionUtils";
import { useFeeLedger } from "../../context/FeeLedgerContext";
import { useFeeStructures } from "../../context/FeeStructureContext";
import "./BulkPromotion.css";
import { apiClient } from "../../services/apiClient";

function BulkPromotion() {
  const { students, updateStudent } = useStudents();
  const { classes } = useClasses();

  const {
    activeYear,
    isPromotionLocked,

  } = useAcademicYear();

  const { upsertLedgerFromFeeStructure } = useFeeLedger();
  const { getActiveFeeStructure } = useFeeStructures();

  const fromAcademicYear = activeYear?.id ?? "";

  /* =========================
     Promotion Runner
  ========================= */

  const handlePromotion = async () => {
    if (!activeYear?.id) return;
    if (isPromotionLocked(activeYear.id)) return;

    for (const student of students) {
      if (!student.id) continue;
      if (student.status !== "Active") continue;
      if (!student.classID) continue;

      const nextClassID = getNextClassId(
        student.classID,
        classes
      );

      if (!nextClassID) {
        await updateStudent(student.id, {
          status: "Alumni",
        });
        continue;
      }

      /* Update student class */

      await updateStudent(student.id, {
        classID: nextClassID,
        sectionID: "",
      });

      /* Get active fee structure */

      const structure = getActiveFeeStructure(
        nextClassID,
        activeYear.id
      );

      if (!structure) continue;

      const components = structure.components.map((c) => ({
        name: c.name,
        amount: c.amount,
      }));

      /* Create ledger */

      await upsertLedgerFromFeeStructure(
        student.id,
        nextClassID,
        activeYear.id,
        components
      );
    }

    /* Lock promotion after processing all students */

    await apiClient.post(`/api/academic-years/${activeYear?.id}/lock-promotion`)
  };

  /* =========================
     Render
  ========================= */

  return (
    <div className="page-container">
      <h1>Bulk Promotion</h1>

      <button
        className="danger"
        onClick={handlePromotion}
        disabled={
          !fromAcademicYear ||
          isPromotionLocked(fromAcademicYear)
        }
      >
        Promote All Eligible Students
      </button>

      {fromAcademicYear &&
        isPromotionLocked(fromAcademicYear) && (
          <p className="note">
            Promotion already completed for this
            academic year.
          </p>
        )}
    </div>
  );
}

export default BulkPromotion;