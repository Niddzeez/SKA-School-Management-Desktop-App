import { useEffect, useState } from "react";
import { apiClient } from "../../../services/apiClient";
import { printReport } from "../Utils/PrintUtils";
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

  // ✅ Derived from API data — safe
  const isDeficit = data.netResult < 0;

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
              isDeficit ? "Net Deficit" : "Net Surplus",
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

      {/* Header */}
      <div className="statement-header">
        <h2>Year-End Financial Statement</h2>
        <p className="statement-subtitle">
          Academic Year: {academicYear}
        </p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="statement-kpi-row">

        <div className="statement-kpi income">
          <div className="statement-kpi-icon">💰</div>
          <div className="statement-kpi-label">Total Income</div>
          <div className="statement-kpi-value">
            ₹{data.totalIncome.toLocaleString("en-IN")}   {/* ✅ en-IN formatting */}
          </div>
          <div className="statement-kpi-sub">Academic Year {academicYear}</div>
        </div>

        <div className="statement-kpi expense">
          <div className="statement-kpi-icon">💸</div>
          <div className="statement-kpi-label">Total Expense</div>
          <div className="statement-kpi-value">
            ₹{data.totalExpense.toLocaleString("en-IN")}
          </div>
          <div className="statement-kpi-sub">Academic Year {academicYear}</div>
        </div>

        <div className="statement-kpi net">
          <div className="statement-kpi-icon">⚖️</div>
          <div className="statement-kpi-label">
            {isDeficit ? "Net Deficit" : "Net Surplus"}
          </div>
          <div className="statement-kpi-value">
            ₹{data.netResult.toLocaleString("en-IN")}
          </div>
          <div className="statement-kpi-sub">Income − Expense</div>
        </div>

      </div>

      {/* ── Monthly Table ── */}
      <table className="reports-table">
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
              <td>₹{m.income.toLocaleString("en-IN")}</td>
              <td>₹{m.expense.toLocaleString("en-IN")}</td>
              <td>₹{m.net.toLocaleString("en-IN")}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Print Button ── */}
      <div className="statement-footer">   {/* ✅ footer wrapper from frontend */}
        <button
          className="print-btn"
          onClick={() => printReport(printData)}
        >
          🖨 Print / Save Statement   {/* ✅ emoji from frontend */}
        </button>
      </div>

    </div>
  );
}

export default YearEndStatement;