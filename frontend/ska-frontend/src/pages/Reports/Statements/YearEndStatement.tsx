import { useFeeLedger } from "../../../context/FeeLedgerContext";
import { useAcademicYear } from "../../../context/AcademicYearContext";
import { getAcademicYearRange } from "../Utils/reportDateUtils";
import { printReport } from "../Utils/PrintUtils";
import "./statements.css";

function YearEndStatement() {
  const { payments, expenses } = useFeeLedger();

  const {
    academicYear,
    setAcademicYear,
    availableYears,
    isYearClosed,
  } = useAcademicYear();

  /* =========================
     Academic Year Range
  ========================= */

  const { start, end } = getAcademicYearRange(academicYear);

  /* =========================
     Filter Yearly Data
  ========================= */

  const yearlyIncome = payments.filter((p) => {
    const d = new Date(p.createdAt);
    return d >= start && d <= end;
  });

  const yearlyExpenses = expenses.filter((e) => {
    const d = new Date(e.expenseDate);
    return d >= start && d <= end;
  });

  /* =========================
     Totals
  ========================= */

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
     Monthly Snapshot
  ========================= */

  const monthlySnapshot = Array.from({ length: 12 }).map((_, i) => {
    const monthStart = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const monthEnd = new Date(
      start.getFullYear(),
      start.getMonth() + i + 1,
      0
    );

    const income = yearlyIncome
      .filter((p) => {
        const d = new Date(p.createdAt);
        return d >= monthStart && d <= monthEnd;
      })
      .reduce((sum, p) => sum + p.amount, 0);

    const expense = yearlyExpenses
      .filter((e) => {
        const d = new Date(e.expenseDate);
        return d >= monthStart && d <= monthEnd;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      month: monthStart.toLocaleString("default", { month: "long" }),
      income,
      expense,
      net: income - expense,
    };
  });

  /* =========================
     Print Data
  ========================= */

  const printData = {
    title: "Year-End Financial Statement",
    meta: {
      academicYear,
      reportType: "STATEMENT",
      granularity: "YEARLY",
      periodLabel: academicYear,
    },
    sections: [
      {
        title: "Income Summary",
        headers: ["Metric", "Amount"],
        rows: [
          { columns: ["Total Income", `₹${totalIncome}`] },
        ],
      },
      {
        title: "Expense Summary",
        headers: ["Metric", "Amount"],
        rows: [
          { columns: ["Total Expense", `₹${totalExpense}`] },
        ],
      },
      {
        title: "Net Result",
        headers: ["Metric", "Amount"],
        rows: [
          {
            columns: [
              netResult >= 0 ? "Net Surplus" : "Net Deficit",
              `₹${netResult}`,
            ],
          },
        ],
      },
      {
        title: "Monthly Snapshot",
        headers: ["Month", "Income", "Expense", "Net"],
        rows: monthlySnapshot.map((m) => ({
          columns: [
            m.month,
            `₹${m.income}`,
            `₹${m.expense}`,
            `₹${m.net}`,
          ],
        })),
      },
    ],
  } as const;

  /* =========================
     Render
  ========================= */

  return (
    <div className="statement-card">
      <div className="statement-header">
        <h2>Year-End Financial Statement</h2>

        <div className="year-selector">
          <label>Academic Year:</label>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
          >
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>

          {isYearClosed(academicYear) && (
            <span className="closed-year-badge">
              Closed Year
            </span>
          )}
        </div>
      </div>

      <div className="summary-block">
        <p>
          <strong>Total Income:</strong> ₹{totalIncome}
        </p>
        <p>
          <strong>Total Expense:</strong> ₹{totalExpense}
        </p>
        <p>
          <strong>
            {netResult >= 0 ? "Net Surplus" : "Net Deficit"}:
          </strong>{" "}
          ₹{netResult}
        </p>
      </div>

      <table className="report-table">
        <thead>
          <tr>
            <th>Month</th>
            <th>Income</th>
            <th>Expense</th>
            <th>Net</th>
          </tr>
        </thead>
        <tbody>
          {monthlySnapshot.map((m) => (
            <tr key={m.month}>
              <td>{m.month}</td>
              <td>₹{m.income}</td>
              <td>₹{m.expense}</td>
              <td>₹{m.net}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        className="print-btn"
        onClick={() => printReport(printData)}
      >
        Print / Save Statement
      </button>
    </div>
  );
}

export default YearEndStatement;
