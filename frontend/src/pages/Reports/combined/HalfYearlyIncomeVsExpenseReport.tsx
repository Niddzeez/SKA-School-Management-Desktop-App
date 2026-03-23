import { useMemo } from "react";
import { useFeeLedger } from "../../../context/FeeLedgerContext";
import { useStudents } from "../../../context/StudentContext";
import { getAcademicYearRange } from "../Utils/reportDateUtils";
import { printReport } from "../Utils/printUtils";
import "../../../components/print/report-print.css";

type Props = {
  academicYear: string;
  half: "H1" | "H2"; // H1 = Apr–Sep, H2 = Oct–Mar
};

function HalfYearlyIncomeVsExpense({ academicYear, half }: Props) {
  const { payments, expenses } = useFeeLedger();
  const { students } = useStudents();

  /* =========================
     Student Lookup Map
  ========================= */

  const studentMap = useMemo(() => {
    const map = new Map<string, string>();
    students.forEach((s) =>
      map.set(s.id, `${s.firstName} ${s.lastName}`)
    );
    return map;
  }, [students]);

  const getStudentName = (id: string) =>
    studentMap.get(id) ?? "Unknown";

  /* =========================
     Half-Year Date Range
  ========================= */

  const { start, end } = getAcademicYearRange(academicYear);

  const { halfStart, halfEnd, periodLabel } = useMemo(() => {
    if (half === "H1") {
      return {
        halfStart: new Date(start.getFullYear(), 3, 1),
        halfEnd: new Date(start.getFullYear(), 8, 30),
        periodLabel: "April–September",
      };
    }

    return {
      halfStart: new Date(start.getFullYear(), 9, 1),
      halfEnd: end,
      periodLabel: "October–March",
    };
  }, [half, start, end]);

  /* =========================
     Filter Data
  ========================= */

  const halfYearIncome = useMemo(() => {
    return payments.filter((p) => {
      const d = new Date(p.createdAt);
      return d >= halfStart && d <= halfEnd;
    });
  }, [payments, halfStart, halfEnd]);

  const halfYearExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const d = new Date(e.expenseDate);
      return d >= halfStart && d <= halfEnd;
    });
  }, [expenses, halfStart, halfEnd]);

  if (halfYearIncome.length === 0 && halfYearExpenses.length === 0) {
    return <p>No financial records for this period.</p>;
  }

  /* =========================
     Totals
  ========================= */

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
      periodLabel,
    },
    sections: [
      {
        title: "Income Details",
        headers: [
          "Date",
          "Student",
          "Mode",
          "Collected By",
          "Amount",
        ],
        rows: halfYearIncome.map((p) => ({
          columns: [
            new Date(p.createdAt).toLocaleDateString(),
            getStudentName(p.studentId),
            p.mode,
            p.collectedBy,
            `₹${p.amount}`,
          ],
        })),
      },
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
      <h3>Half-Yearly Income vs Expense — {periodLabel}</h3>

      {/* Income */}
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
          {halfYearIncome.map((p) => (
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

      {/* Expenses */}
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