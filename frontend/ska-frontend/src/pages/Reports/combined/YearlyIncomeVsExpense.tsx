import { useMemo } from "react";
import { useFeeLedger } from "../../../context/FeeLedgerContext";
import { useStudents } from "../../../context/StudentContext";
import { getAcademicYearRange } from "../Utils/reportDateUtils";
import { printReport } from "../Utils/PrintUtils";
import "../../../components/print/report-print.css";

type Props = {
  academicYear: string;
};

function YearlyIncomeVsExpense({ academicYear }: Props) {
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
     Academic Year Range
  ========================= */

  const { start, end } = getAcademicYearRange(academicYear);

  /* =========================
     Filter Data
  ========================= */

  const yearlyIncome = useMemo(() => {
    return payments.filter((p) => {
      const d = new Date(p.createdAt);
      return d >= start && d <= end;
    });
  }, [payments, start, end]);

  const yearlyExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const d = new Date(e.expenseDate);
      return d >= start && d <= end;
    });
  }, [expenses, start, end]);

  if (yearlyIncome.length === 0 && yearlyExpenses.length === 0) {
    return (
      <p>No financial records found for academic year {academicYear}.</p>
    );
  }

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
        title: "Income Details",
        headers: [
          "Date",
          "Student",
          "Mode",
          "Collected By",
          "Amount",
        ],
        rows: yearlyIncome.map((p) => ({
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
        rows: yearlyExpenses.map((e) => ({
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
      <h3>Yearly Income vs Expense — {academicYear}</h3>

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