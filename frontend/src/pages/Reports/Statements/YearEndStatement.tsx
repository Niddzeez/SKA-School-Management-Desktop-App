import { useEffect, useState } from "react";
import { apiClient } from "../../../services/apiClient";
import { printReport } from "../Utils/PrintUtils";
import { toBackendAcademicYear } from "../Utils/reportDateUtils";
import "./statements.css";

type YearEndStatementProps = {
  academicYear: string;
};

interface MonthlySnapshot {
  month: string;
  income: number;
  expense: number;
  net: number;
}

interface YearEndData {
  totalIncome: number;
  totalExpense: number;
  netResult: number;
  monthlySnapshot: MonthlySnapshot[];
}

function YearEndStatement({ academicYear }: YearEndStatementProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<YearEndData | null>(null);

  /* =========================
     Fetch Year-End Report
  ========================= */

  useEffect(() => {
    if (!academicYear) return;

    const fetchStatement = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await apiClient.get<YearEndData>(
          `/api/reports/year-end?year=${academicYear}`
        );

        setData(res);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load year-end statement");
      } finally {
        setLoading(false);
      }
    };

    fetchStatement();
  }, [academicYear]);

  if (loading) return <p>Loading financial statement...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!data) return null;

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
          { columns: ["Total Income", `₹${data.totalIncome}`] },
        ],
      },
      {
        title: "Expense Summary",
        headers: ["Metric", "Amount"],
        rows: [
          { columns: ["Total Expense", `₹${data.totalExpense}`] },
        ],
      },
      {
        title: "Net Result",
        headers: ["Metric", "Amount"],
        rows: [
          {
            columns: [
              data.netResult >= 0 ? "Net Surplus" : "Net Deficit",
              `₹${data.netResult}`,
            ],
          },
        ],
      },
      {
        title: "Monthly Snapshot",
        headers: ["Month", "Income", "Expense", "Net"],
        rows: data.monthlySnapshot.map((m) => ({
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
        <p className="statement-subtitle">
          Academic Year: {academicYear}
        </p>
      </div>

      {/* =========================
         Summary
      ========================= */}

      <div className="summary-block">
        <p>
          <strong>Total Income:</strong> ₹{data.totalIncome}
        </p>

        <p>
          <strong>Total Expense:</strong> ₹{data.totalExpense}
        </p>

        <p>
          <strong>
            {data.netResult >= 0 ? "Net Surplus" : "Net Deficit"}:
          </strong>{" "}
          ₹{data.netResult}
        </p>
      </div>

      {/* =========================
         Monthly Table
      ========================= */}

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
          {data.monthlySnapshot.map((m, index) => (
            <tr key={`${m.month}-${index}`}>
              <td>{m.month}</td>
              <td>₹{m.income}</td>
              <td>₹{m.expense}</td>
              <td>₹{m.net}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* =========================
         Print Button
      ========================= */}

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