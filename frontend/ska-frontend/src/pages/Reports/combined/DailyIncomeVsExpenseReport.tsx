// src/pages/Reports/combined/DailyIncomeVsExpense.tsx

import { useFeeLedger } from "../../../context/FeeLedgerContext";
import { useStudents } from "../../../context/StudentContext";
import { getAcademicYearRange } from "../Utils/reportDateUtils";
import { printReport } from "../Utils/PrintUtils";
import "../../../components/print/report-print.css";

type Props = {
  academicYear: string;
  selectedDate: string | null; // yyyy-mm-dd
};

function DailyIncomeVsExpense({ academicYear, selectedDate }: Props) {
  const { payments, expenses } = useFeeLedger();

  if (!selectedDate) {
    return <p>Please select a date.</p>;
  }

  const getStudentName = (studentId: string) => {
    const s = students.find((st) => st.id === studentId);
    return s ? `${s.firstName} ${s.lastName}` : "Unknown";
  };
  const { students } = useStudents();
  /* =========================
     Academic Year Validation
  ========================= */

  const { start, end } = getAcademicYearRange(academicYear);
  const target = new Date(selectedDate);

  if (target < start || target > end) {
    return (
      <p>
        Selected date does not belong to academic year {academicYear}.
      </p>
    );
  }

  /* =========================
     Filter Income & Expenses
  ========================= */

  const dailyIncome = payments.filter((p) => {
    const d = new Date(p.createdAt);
    return d.toDateString() === target.toDateString();
  });

  const dailyExpenses = expenses.filter((e) => {
    const d = new Date(e.expenseDate);
    return d.toDateString() === target.toDateString();
  });

  if (dailyIncome.length === 0 && dailyExpenses.length === 0) {
    return <p>No records found on this date.</p>;
  }

  const totalIncome = dailyIncome.reduce(
    (sum, p) => sum + p.amount,
    0
  );

  const totalExpense = dailyExpenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );

  const netResult = totalIncome - totalExpense;

  /* =========================
     Print Data
  ========================= */

  const printData = {
  title: "Daily Income vs Expense Report",
  meta: {
    academicYear,
    reportType: "COMBINED",
    granularity: "DAILY",
    periodLabel: target.toLocaleDateString(),
  },
  sections: [
    {
      title: "Income Details",
      headers: ["Date", "Student", "Mode", "Amount"],
      rows: dailyIncome.map((p) => ({
        columns: [
          p.createdAt,
          `${getStudentName(p.studentId)} — ${p.mode}`,
          `₹${p.amount}`,
        ],
      })),
    },
    {
      title: "Expense Details",
      headers: ["Date", "Category", "Paid To", "Mode", "Amount"],
      rows: dailyExpenses.map((e) => ({
        columns: [
          e.expenseDate,
          e.category,
          e.paidTo,
          e.mode,
          `₹${e.amount}`,
        ],
      })),
    },
    {
      title: "Summary",
      headers: ["Metric", "Value"],
      rows: [
        { columns: ["Total Income", `₹${totalIncome}`] },
        { columns: ["Total Expense", `₹${totalExpense}`] },
        { columns: ["Net Result", `₹${netResult}`] },
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
        Daily Income vs Expense — {target.toLocaleDateString()}
      </h3>

      {/* Income */}
      <h4>Income</h4>
      <table className="report-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Mode</th>
            <th>Collected By</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {dailyIncome.map((p) => (
            <tr key={p.id}>
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

      {/* Expenses */}
      <h4 style={{ marginTop: "20px" }}>Expenses</h4>
      <table className="report-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Description</th>
            <th>Paid To</th>
            <th>Mode</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {dailyExpenses.map((e) => (
            <tr key={e.id}>
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

export default DailyIncomeVsExpense;
