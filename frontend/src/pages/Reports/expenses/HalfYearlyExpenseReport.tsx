import { useMemo } from "react";
import { useFeeLedger } from "../../../context/FeeLedgerContext";
import { getAcademicYearRange } from "../Utils/reportDateUtils";
import { printReport } from "../Utils/printUtils";
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

  const { halfStart, halfEnd, periodLabel } = useMemo(() => {
    if (half === "H1") {
      return {
        halfStart: new Date(start.getFullYear(), 3, 1), // Apr 1
        halfEnd: new Date(start.getFullYear(), 8, 30), // Sep 30
        periodLabel: "April–September",
      };
    }

    return {
      halfStart: new Date(start.getFullYear(), 9, 1), // Oct 1
      halfEnd: end,
      periodLabel: "October–March",
    };
  }, [half, start, end]);

  /* =========================
     Filter Expenses
  ========================= */

  const halfYearExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const d = new Date(e.expenseDate);
      return d >= halfStart && d <= halfEnd;
    });
  }, [expenses, halfStart, halfEnd]);

  if (halfYearExpenses.length === 0) {
    return <p>No expenses recorded for this period.</p>;
  }

  /* =========================
     Totals
  ========================= */

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
      periodLabel,
    },
    sections: [
      {
        title: "Expense Details",
        headers: [
          "Date",
          "Category",
          "Description",
          "Paid To",
          "Mode",
          "Amount",
        ],
        rows: halfYearExpenses.map((e) => ({
          columns: [
            new Date(e.expenseDate).toLocaleDateString(),
            e.category,
            e.description,
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
      <h3>Half-Yearly Expense Report — {periodLabel}</h3>

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