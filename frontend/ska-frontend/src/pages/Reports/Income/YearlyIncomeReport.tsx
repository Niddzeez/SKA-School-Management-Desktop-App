// src/pages/Reports/income/YearlyIncomeReport.tsx

import { useFeeLedger } from "../../../context/FeeLedgerContext";
import { useStudents } from "../../../context/StudentContext";
import { getAcademicYearRange } from "../Utils/reportDateUtils";
import { printReport } from "../Utils/printUtils";
import "./incomeReports.css";

type Props = {
  academicYear: string;
};

function YearlyIncomeReport({ academicYear }: Props) {
  const { payments } = useFeeLedger();
  const { students } = useStudents();

  const getStudentName = (studentId: string) => {
    const s = students.find((st) => st.id === studentId);
    return s ? `${s.firstName} ${s.lastName}` : "Unknown";
  };

  /* =========================
     Academic Year Range
  ========================= */

  const { start, end } = getAcademicYearRange(academicYear);

  /* =========================
     Filter Income
  ========================= */

  const yearlyIncome = payments.filter((p) => {
    const d = new Date(p.createdAt);
    return d >= start && d <= end;
  });

  if (yearlyIncome.length === 0) {
    return <p>No income recorded for academic year {academicYear}.</p>;
  }

  const totalIncome = yearlyIncome.reduce(
    (sum, p) => sum + p.amount,
    0
  );

  /* =========================
     Print Data
  ========================= */

  const printData = {
        title: "Yearly Income Report",
        meta: {
            academicYear,
            reportType: "INCOME",
            granularity: "YEARLY",
            periodLabel: academicYear,
        },
        sections: [
            {
                title: "Income Details",
                headers: ["Date", "Student", "Mode", "Amount"],
                rows: yearlyIncome.map((p) => ({
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
                rows: [{ columns: ["Total Income", `₹${totalIncome}`] }],
            },
        ],
    } as const;


  /* =========================
     Render
  ========================= */

  return (
    <div className="report-card">
      <h3>Yearly Income Report — {academicYear}</h3>

      <table className="report-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Student</th>
            <th>Mode</th>
            <th>Collected By</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {yearlyIncome.map((p) => (
            <tr key={p.id}>
              <td>{new Date(p.createdAt).toLocaleDateString()}</td>
              <td>{getStudentName(p.studentId)}</td>
              <td>{p.mode}</td>
              <td>{p.collectedBy}</td>
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

export default YearlyIncomeReport;
