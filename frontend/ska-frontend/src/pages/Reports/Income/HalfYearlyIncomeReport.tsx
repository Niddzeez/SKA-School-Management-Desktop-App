// src/pages/Reports/income/HalfYearlyIncomeReport.tsx

import { useFeeLedger } from "../../../context/FeeLedgerContext";
import { useStudents } from "../../../context/StudentContext";
import { getAcademicYearRange } from "../Utils/reportDateUtils";
import { printReport } from "../Utils/printUtils";
import "./incomeReports.css";

type Props = {
  academicYear: string;
  half: "H1" | "H2"; // H1 = Apr–Sep, H2 = Oct–Mar
};

function HalfYearlyIncomeReport({ academicYear, half }: Props) {
  const { payments } = useFeeLedger();
  const { students } = useStudents();

  const { start, end } = getAcademicYearRange(academicYear);

  const getStudentName = (studentId: string) => {
    const s = students.find((st) => st.id === studentId);
    return s ? `${s.firstName} ${s.lastName}` : "Unknown";
  };

  /* =========================
     Half-Year Date Range
  ========================= */

  const halfStart =
    half === "H1"
      ? new Date(start.getFullYear(), 3, 1) // April 1
      : new Date(start.getFullYear(), 9, 1); // Oct 1

  const halfEnd =
    half === "H1"
      ? new Date(start.getFullYear(), 8, 30) // Sep 30
      : end; // March 31

  /* =========================
     Filter Income
  ========================= */

  const halfYearIncome = payments.filter((p) => {
    const d = new Date(p.createdAt);
    return d >= halfStart && d <= halfEnd;
  });

  if (halfYearIncome.length === 0) {
    return <p>No income recorded for this period.</p>;
  }

  const totalIncome = halfYearIncome.reduce(
    (sum, p) => sum + p.amount,
    0
  );

  /* =========================
     Print Data
  ========================= */

    const printData = {
    title: "Half-Yearly Income Report",
    meta: {
      academicYear,
      reportType: "INCOME",
      granularity: "HALF_YEARLY",
      periodLabel:
        half === "H1"
          ? "April–September"
          : "October–March",
    },
    sections: [
      {
        title: "Income Details",
        headers: ["Date", "Student", "Mode", "Amount"],
        rows: halfYearIncome.map((p) => ({
          columns: [
            new Date(p.createdAt).toLocaleDateString(),
            getStudentName(p.studentId),
            p.mode,
            `₹${p.amount}`,
          ],
        })),
      },
      {
        title: "Summary",
        headers: ["Metric", "Value"],
        rows: [
          {
            columns: ["Total Income", `₹${totalIncome}`],
          },
        ],
      },
    ],
  } as const;


  /* =========================
     Render
  ========================= */

  return (
    <div className="report-card">
      <h3>
        Half-Yearly Income Report —{" "}
        {half === "H1" ? "April–September" : "October–March"}
      </h3>

      <table className="report-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Student</th>
            <th>Mode</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {halfYearIncome.map((p) => (
            <tr key={p.id}>
              <td>{new Date(p.createdAt).toLocaleDateString()}</td>
              <td>{getStudentName(p.studentId)}</td>
              <td>{p.mode}</td>
              <td className="amount">₹{p.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="total-line">
        <strong>Total Income:</strong> ₹{totalIncome}
      </p>

      <button
        className="print-btn"
        onClick={() => printReport(printData)}
      >
        Print / Save as PDF
      </button>
    </div>
  );
}

export default HalfYearlyIncomeReport;
