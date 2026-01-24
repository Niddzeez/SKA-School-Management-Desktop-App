// src/pages/Reports/combined/HalfYearlyIncomeVsExpense.tsx

import { useFeeLedger } from "../../../context/FeeLedgerContext";
import { useStudents } from "../../../context/StudentContext";
import { getAcademicYearRange } from "../Utils/reportDateUtils";
import { printReport } from "../Utils/printUtils";
import "./CombinedReports.css";

type Props = {
  academicYear: string;
  half: "H1" | "H2"; // H1 = Apr–Sep, H2 = Oct–Mar
};

function HalfYearlyIncomeVsExpense({ academicYear, half }: Props) {
  const { payments, expenses } = useFeeLedger();
  const { students } = useStudents();

  const getStudentName = (studentId: string) => {
    const s = students.find((st) => st.id === studentId);
    return s ? `${s.firstName} ${s.lastName}` : "Unknown";
  };

  /* =========================
     Half-Year Date Range
  ========================= */

  const { start, end } = getAcademicYearRange(academicYear);

  const halfStart =
    half === "H1"
      ? new Date(start.getFullYear(), 3, 1) // April 1
      : new Date(start.getFullYear(), 9, 1); // Oct 1

  const halfEnd =
    half === "H1"
      ? new Date(start.getFullYear(), 8, 30) // Sep 30
      : end; // March 31

  /* =========================
     Filter Income & Expenses
  ========================= */

  const halfYearIncome = payments.filter((p) => {
    const d = new Date(p.createdAt);
    return d >= halfStart && d <= halfEnd;
  });

  const halfYearExpenses = expenses.filter((e) => {
    const d = new Date(e.expenseDate);
    return d >= halfStart && d <= halfEnd;
  });

  if (
    halfYearIncome.length === 0 &&
    halfYearExpenses.length === 0
  ) {
    return <p>No financial records for this period.</p>;
  }

  const totalIncome = halfYearIncome.reduce(
    (sum, p) => sum + p.amount,
    0
  );

  const totalExpense = halfYearExpenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );

  const netResult = totalIncome - totalExpense;

  /* =========================
     Print Data
  ========================= */

  const printData = {
  title: "Half-Yearly Income vs Expense Report",
  meta: {
    academicYear,
    reportType: "COMBINED",
    granularity: "HALF_YEARLY",
    periodLabel:
      half === "H1"
        ? "April–September"
        : "October–March",
  },
  sections: [
    {
      title: "Summary",
      headers: ["Metric", "Amount"],
      rows: [
        { columns: ["Total Income", `₹${totalIncome}`] },
        { columns: ["Total Expense", `₹${totalExpense}`] },
        {
          columns: ["Net Result", `₹${totalIncome - totalExpense}`],
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
        Half-Yearly Income vs Expense —{" "}
        {half === "H1" ? "April–September" : "October–March"}
      </h3>

      {/* Income Table */}
      <h4>Income</h4>
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

      {/* Expense Table */}
      <h4 style={{ marginTop: "20px" }}>Expenses</h4>
      <table className="report-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Paid To</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {halfYearExpenses.map((e) => (
            <tr key={e.id}>
              <td>{new Date(e.expenseDate).toLocaleDateString()}</td>
              <td>{e.category}</td>
              <td>{e.paidTo}</td>
              <td className="amount">₹{e.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="total-line">
        <strong>Total Expense:</strong> ₹{totalExpense}
      </p>

      <p className="total-line">
        <strong>Net Result:</strong> ₹{netResult}
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

export default HalfYearlyIncomeVsExpense;
