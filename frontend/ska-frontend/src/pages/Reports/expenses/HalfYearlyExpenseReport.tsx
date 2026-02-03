// src/pages/Reports/expenses/HalfYearlyExpenseReport.tsx

import { useFeeLedger } from "../../../context/FeeLedgerContext";
import { getAcademicYearRange } from "../Utils/reportDateUtils";
import { printReport } from "../Utils/PrintUtils";
import "../../../components/print/report-print.css";

type Props = {
  academicYear: string;
  half: "H1" | "H2"; // H1 = Apr–Sep, H2 = Oct–Mar
};

function HalfYearlyExpenseReport({ academicYear, half }: Props) {
  const { expenses } = useFeeLedger();

  const { start, end } = getAcademicYearRange(academicYear);

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
     Filter Expenses
  ========================= */

  const halfYearExpenses = expenses.filter((e) => {
    const d = new Date(e.expenseDate);
    return d >= halfStart && d <= halfEnd;
  });

  if (halfYearExpenses.length === 0) {
    return <p>No expenses recorded for this period.</p>;
  }

  const totalExpense = halfYearExpenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );

  /* =========================
     Print Data
  ========================= */

  const printData = {
    title: "Half-Yearly Expense Report",
    meta: {
      academicYear,
      reportType: "EXPENSE",
      granularity: "HALF_YEARLY",
      periodLabel:
        half === "H1"
          ? "April–September"
          : "October–March",
    },
    sections: [
      {
        title: "Expense Details",
        headers: ["Date", "Paid To", "Category", "Amount"],
        rows: halfYearExpenses.map((e) => ({
          columns: [
            new Date(e.expenseDate).toLocaleDateString(),
            e.paidTo,
            e.category,
            `₹${e.amount}`,
          ],
        })),
      },
      {
        title: "Expense Details",
        headers: ["Date", "Category", "Amount"],
        rows: halfYearExpenses.map((e) => ({
          columns: [
            new Date(e.expenseDate).toLocaleDateString(),
            e.category,
            `₹${e.amount}`,
          ],
        })),
      },
      {
        title: "Summary",
        headers: ["Metric", "Value"],
        rows: [
          {
            columns: ["Total Expense", `₹${totalExpense}`],
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
        Half-Yearly Expense Report —{" "}
        {half === "H1" ? "April–September" : "October–March"}
      </h3>

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
          {halfYearExpenses.map((e) => (
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

      <button
        className="print-btn"
        onClick={() => printReport(printData)}
      >
        Print / Save as PDF
      </button>
    </div>
  );
}

export default HalfYearlyExpenseReport;
