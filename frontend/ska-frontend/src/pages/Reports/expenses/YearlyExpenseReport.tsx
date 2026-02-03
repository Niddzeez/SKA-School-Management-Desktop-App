// src/pages/Reports/expenses/YearlyExpenseReport.tsx

import { useFeeLedger } from "../../../context/FeeLedgerContext";
import { getAcademicYearRange } from "../Utils/reportDateUtils";
import { printReport } from "../Utils/PrintUtils";
import "../../../components/print/report-print.css";

type Props = {
  academicYear: string;
};

function YearlyExpenseReport({ academicYear }: Props) {
  const { expenses } = useFeeLedger();

  /* =========================
     Academic Year Range
  ========================= */

  const { start, end } = getAcademicYearRange(academicYear);

  /* =========================
     Filter Expenses
  ========================= */

  const yearlyExpenses = expenses.filter((e) => {
    const d = new Date(e.expenseDate);
    return d >= start && d <= end;
  });

  if (yearlyExpenses.length === 0) {
    return <p>No expenses recorded for academic year {academicYear}.</p>;
  }

  const totalExpense = yearlyExpenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );

  /* =========================
     Print Data
  ========================= */

  const printData = {
    title: "Yearly Expense Report",
    meta: {
      academicYear,
      reportType: "EXPENSE",
      granularity: "YEARLY",
      periodLabel: academicYear,
    },
    sections: [
      {
        title: "Expense Details",
        headers: ["Date", "Paid To", "Category", "Amount"],
        rows: yearlyExpenses.map((e) => ({
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
        rows: yearlyExpenses.map((e) => ({
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
      <h3>Yearly Expense Report — {academicYear}</h3>

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

      <button
        className="print-btn"
        onClick={() => printReport(printData)}
      >
        Print / Save as PDF
      </button>
    </div>
  );
}

export default YearlyExpenseReport;
