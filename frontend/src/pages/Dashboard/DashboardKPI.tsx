import { useEffect, useState } from "react";
import { useAcademicYear } from "../../context/AcademicYearContext";
import { apiClient } from "../../services/apiClient";
import "./dashboard.css";
import { useNavigate } from "react-router-dom";
import CalendarKPI from "./CalendarKPI";

interface DashboardOverview {
  totalStudents:    number;
  totalCollected:   number;
  totalPending:     number;
  totalAdjustments: number;
  totalExpenses:    number;
  netBalance:       number;
}

interface MonthlyCollection {
  month: string;
  total: number;
}

function DashboardKPIs() {
  const { activeYear } = useAcademicYear();
  const navigate = useNavigate();

  const [loading,     setLoading]     = useState<boolean>(true);
  const [error,       setError]       = useState<string | null>(null);
  const [overview,    setOverview]    = useState<DashboardOverview | null>(null);
  const [collections, setCollections] = useState<MonthlyCollection[]>([]);

  /* =========================
     Fetch from backend
  ========================= */

  useEffect(() => {
    async function fetchDashboard() {
      if (!activeYear?.id) return;
      try {
        setLoading(true);
        setError(null);

        const [overviewRes, collectionsRes] = await Promise.all([
          apiClient.get<DashboardOverview>(
            `/api/dashboard/overview?year=${activeYear.id}`
          ),
          apiClient.get<MonthlyCollection[]>(
            `/api/dashboard/monthly-collections?year=${activeYear.id}`
          ),
        ]);

        setOverview(overviewRes);
        setCollections(collectionsRes);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [activeYear?.id]);

  /* =========================
     Loading / Error states
  ========================= */

  if (loading)   return <div className="kpi-loading">Loading Dashboard Data…</div>;
  if (error)     return <div className="kpi-error">Error loading dashboard: {error}</div>;
  if (!overview) return null;

  /* =========================
     Render
  ========================= */

  return (
    <div className="dashboard-kpis">

      {/* ═══════════════════════════════════
          ROW 1 — 3 Primary Gradient Cards
      ═══════════════════════════════════ */}
      <div className="kpi-row-primary">

        {/* Total Income */}
        <div className="kpi-card-primary kpi-income">
          <div className="kpi-card-top">
            <div className="kpi-card-icon">💰</div>
            <div className="kpi-card-arrow">↗</div>
          </div>
          <div className="kpi-card-label">Total Income</div>
          <p className="kpi-card-value">
            ₹{overview.totalCollected.toLocaleString("en-IN")}
          </p>
          <span className="kpi-card-sub">Academic Year {activeYear?.name}</span>
        </div>

        {/* Total Expense */}
        <div className="kpi-card-primary kpi-expense">
          <div className="kpi-card-top">
            <div className="kpi-card-icon">💸</div>
            <div className="kpi-card-arrow">↗</div>
          </div>
          <div className="kpi-card-label">Total Expense</div>
          <p className="kpi-card-value">
            ₹{overview.totalExpenses.toLocaleString("en-IN")}
          </p>
          <span className="kpi-card-sub">Academic Year {activeYear?.name}</span>
        </div>

        {/* Net Balance */}
        <div className="kpi-card-primary kpi-balance">
          <div className="kpi-card-top">
            <div className="kpi-card-icon">⚖️</div>
            <div className="kpi-card-arrow">↗</div>
          </div>
          <div className="kpi-card-label">Net Balance</div>
          <p className="kpi-card-value">
            ₹{overview.netBalance.toLocaleString("en-IN")}
          </p>
          <span className="kpi-card-sub">Income − Expense</span>
        </div>

      </div>

      {/* ═══════════════════════════════════
          ROW 2 — Secondary Cards + Calendar
      ═══════════════════════════════════ */}
      <div className="kpi-body-row">

        {/* Left: 2×2 secondary cards */}
        <div className="kpi-secondary-grid">

          {/* Total Students */}
          <div className="kpi-card-secondary sec-income">
            <div className="kpi-sec-blob" />
            <div className="kpi-sec-top">
              <div className="kpi-sec-label">Total Students</div>
              <div className="kpi-sec-icon">🎓</div>
            </div>
            <p className="kpi-sec-value">{overview.totalStudents}</p>
            <span className="kpi-sec-badge badge-income">● In active ledgers</span>
          </div>

          {/* Total Adjustments */}
          <div className="kpi-card-secondary sec-expense">
            <div className="kpi-sec-blob" />
            <div className="kpi-sec-top">
              <div className="kpi-sec-label">Total Adjustments</div>
              <div className="kpi-sec-icon">🔧</div>
            </div>
            <p className="kpi-sec-value">
              ₹{overview.totalAdjustments.toLocaleString("en-IN")}
            </p>
            <span className="kpi-sec-badge badge-expense">
              ↓ Academic Year {activeYear?.name}
            </span>
          </div>

          {/* Total Pending Fees */}
          <div className="kpi-card-secondary sec-fees">
            <div className="kpi-sec-blob" />
            <div className="kpi-sec-top">
              <div className="kpi-sec-label">Total Pending Fees</div>
              <div className="kpi-sec-icon">⚠️</div>
            </div>
            <p className="kpi-sec-value">
              ₹{overview.totalPending.toLocaleString("en-IN")}
            </p>
            <span className="kpi-sec-badge badge-fees">
              ⚠ Academic Year {activeYear?.name}
            </span>
          </div>

          {/* Students with Dues — navigable */}
          <div
            className="kpi-card-secondary sec-dues"
            onClick={() => navigate("/dashboard/admin/pending-fees")}
            style={{ cursor: "pointer" }}
          >
            <div className="kpi-sec-blob" />
            <div className="kpi-sec-top">
              <div className="kpi-sec-label">Students With Dues</div>
              <div className="kpi-sec-icon">📋</div>
            </div>
            <p className="kpi-sec-value">{overview.totalStudents}</p>
            <span className="kpi-sec-badge badge-dues">● Students with pending fees</span>
          </div>

        </div>

        {/* Right: Calendar widget */}
        <CalendarKPI />

      </div>

      {/* ═══════════════════════════════════
          Monthly Collections Table
      ═══════════════════════════════════ */}
      <div className="dashboard-section monthly-collections">
        <h3>Monthly Collections</h3>
        {collections.length === 0 ? (
          <p className="kpi-empty">No collections recorded for this year.</p>
        ) : (
          <table className="report-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Collected Amount</th>
              </tr>
            </thead>
            <tbody>
              {collections.map((m) => (
                <tr key={m.month}>
                  <td>{m.month}</td>
                  <td className="amount">₹{m.total.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}

export default DashboardKPIs;