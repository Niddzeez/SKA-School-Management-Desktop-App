// src/pages/Reports/combined/YearlyIncomeVsExpense.tsx

import { useFeeLedger } from "../../../context/FeeLedgerContext";
import { useStudents } from "../../../context/StudentContext";
import { getAcademicYearRange } from "../Utils/reportDateUtils";
import { printReport } from "../Utils/printUtils";
import "./CombinedReports.css";

type Props = {
  academicYear: string;
};

function YearlyIncomeVsExpense({ academicYear }: Props) {
  const { payments, expenses } = useFeeLedger();
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
     Filter Income & Expenses
  ========================= */

  const yearlyIncome = payments.filter((p) => {
    const d = new Date(p.createdAt);
    return d >= start && d <= end;
  });

  const yearlyExpenses = expenses.filter((e) => {
    const d = new Date(e.expenseDate);
    return d >= start && d <= end;
  });

  if (yearlyIncome.length === 0 && yearlyExpenses.length === 0) {
    return (
      <p>No financial records found for academic year {academicYear}.</p>
    );
  }

  const totalIncome = yearlyIncome.reduce(
    (sum, p) => sum + p.amount,
    0
  );

  const totalExpense = yearlyExpenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );

  const netResult = totalIncome - totalExpense;

  /* =========================
     Print Data
  ========================= */

  const printData = {
  title: "Yearly Income vs Expense Report",
  meta: {
    academicYear,
    reportType: "COMBINED",
    granularity: "YEARLY",
    periodLabel: academicYear,
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
      <h3>Yearly Income vs Expense — {academicYear}</h3>

      {/* Income Table */}
      <h4>Income</h4>
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

      {/* Expense Table */}
      <h4 style={{ marginTop: "20px" }}>Expenses</h4>
      <table className="report-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th>Paid To</th>
            <th>Mode</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {yearlyExpenses.map((e) => (
            <tr key={e.id}>
              <td>{new Date(e.expenseDate).toLocaleDateString()}</td>
              <td>{e.category}</td>
              <td>{e.description}</td>
              <td>{e.paidTo}</td>
              <td>{e.mode}</td>
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

export default YearlyIncomeVsExpense;
