import { useNavigate } from "react-router-dom";
import { useFeeLedger } from "../../context/FeeLedgerContext";
import { useStudents } from "../../context/StudentContext";
import { useClasses } from "../../context/ClassContext";
import { useAcademicYear } from "../../context/AcademicYearContext";
import { printReport } from "../Reports/Utils/PrintUtils";
import "../../styles/PendingFees.css";

function PendingFees() {
  const navigate = useNavigate();

  const { ledgers, getLedgerSummary } = useFeeLedger();
  const { students } = useStudents();
  const { classes } = useClasses();
  const { academicYear } = useAcademicYear();

  /* =========================
     UI DATA (NO EXPORT LOGIC)
  ========================= */

  const pendingList = ledgers
    .filter((l) => l.academicYear === academicYear)
    .map((ledger) => {
      const summary = getLedgerSummary(ledger.id);
      const student = students.find(
        (s) => s.id === ledger.studentId
      );

      return {
        ledgerId: ledger.id,
        student,
        total: summary.finalFee,
        paid: summary.paidTotal,
        pending: summary.pending,
      };
    })
    .filter((row) => row.pending > 0);

  /* =========================
     EXPORT PDF (CLASS-WISE)
     LOGIC LIVES ONLY HERE
  ========================= */

  const handleExportPDF = () => {
    const classWiseMap = new Map<string, typeof pendingList>();

    // Group by class (export-only)
    pendingList.forEach((row) => {
      const classId = row.student?.classID ?? "UNKNOWN";

      if (!classWiseMap.has(classId)) {
        classWiseMap.set(classId, []);
      }

      classWiseMap.get(classId)!.push(row);
    });

    const sections: any[] = [];

    classWiseMap.forEach((rows, classId) => {
      // Sort ONLY for export
      const sortedRows = [...rows].sort(
        (a, b) => b.pending - a.pending
      );

      const className =
        classes.find((c) => c.id === classId)?.ClassName??
        "Unknown Class";

      const classTotalPending = sortedRows.reduce(
        (sum, r) => sum + r.pending,
        0
      );

      sections.push({
        title: `Class ${className}`,
        headers: [
          "Student Name",
          "Phone Number",
          "Total Fee",
          "Paid",
          "Pending",
        ],
        rows: sortedRows.map((r) => ({
          columns: [
            `${r.student?.firstName} ${r.student?.lastName}`,
            r.student?.phoneNumber ??
              r.student?.father.phone ??
              "—",
            `₹${r.total}`,
            `₹${r.paid}`,
            `₹${r.pending}`,
          ],
        })),
        footer: `Class Total Pending: ₹${classTotalPending}`,
      });
    });

    const printData = {
  title: "Pending Fees Report",
  meta: {
    academicYear,
    reportType: "STATEMENT",
    granularity: "CLASS_WISE",
    periodLabel: "Pending Fees",
  },
  sections,
} as const;

printReport(printData);
    };

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="pending-fees-page">
      <div className="pending-fees-header">
        <h2>Students with Pending Fees</h2>

        <button onClick={handleExportPDF}>
          Export Pending Fees (PDF)
        </button>
      </div>

      {pendingList.length === 0 ? (
        <p>No pending fees 🎉</p>
      ) : (
        <table className="pending-fees-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Total Fee</th>
              <th>Paid</th>
              <th>Pending</th>
            </tr>
          </thead>
          <tbody>
            {pendingList.map((row) => (
              <tr
                key={row.ledgerId}
                className="clickable-row"
                onClick={() =>
                  row.student &&
                  navigate(`/students/${row.student.id}`)
                }
              >
                <td>
                  {row.student
                    ? `${row.student.firstName} ${row.student.lastName}`
                    : "Unknown"}
                </td>
                <td>₹{row.total}</td>
                <td>₹{row.paid}</td>
                <td className="pending">
                  ₹{row.pending}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PendingFees;
