import React from "react";
import { useFeeLedger } from "../../context/FeeLedgerContext";
import { useAcademicYear } from "../../context/AcademicYearContext";
import { getAcademicYearRange } from "../Reports/Utils/reportDateUtils";
import "./dashboard.css";
import { useNavigate } from "react-router-dom";
import CalendarKPI from "./CalendarKPI";

function DashboardKPIs(): React.ReactElement {
  const { payments, expenses, ledgers, getLedgerSummary } = useFeeLedger();
  const { academicYear } = useAcademicYear();
  const navigate = useNavigate();

  /* =========================
     Academic Year Range
  ========================= */

  const { start, end } = getAcademicYearRange(academicYear);

  /* =========================
     YEARLY TOTALS
  ========================= */

  let totalIncome = 0;
  let totalExpense = 0;

  payments.forEach((p) => {
    const d = new Date(p.createdAt);
    if (d >= start && d <= end) totalIncome += p.amount;
  });

  expenses.forEach((e) => {
    const d = new Date(e.expenseDate);
    if (d >= start && d <= end) totalExpense += e.amount;
  });

  const netBalance = totalIncome - totalExpense;

  /* =========================
     LATEST MONTH WITH DATA
  ========================= */

  let referenceMonth: number | null = null;

  payments.forEach((p) => {
    const d = new Date(p.createdAt);
    if (d >= start && d <= end) referenceMonth = d.getMonth();
  });

  expenses.forEach((e) => {
    const d = new Date(e.expenseDate);
    if (d >= start && d <= end) referenceMonth = d.getMonth();
  });

  let monthIncome = 0;
  let monthExpense = 0;

  if (referenceMonth !== null) {
    payments.forEach((p) => {
      const d = new Date(p.createdAt);
      if (d >= start && d <= end && d.getMonth() === referenceMonth)
        monthIncome += p.amount;
    });
    expenses.forEach((e) => {
      const d = new Date(e.expenseDate);
      if (d >= start && d <= end && d.getMonth() === referenceMonth)
        monthExpense += e.amount;
    });
  }

  /* =========================
     PENDING FEES
  ========================= */

  let totalPending = 0;
  let studentsWithPending = 0;

  ledgers.forEach((ledger) => {
    if (ledger.academicYear !== academicYear) return;
    const summary = getLedgerSummary(ledger.id);
    if (summary.pending > 0) {
      totalPending += summary.pending;
      studentsWithPending += 1;
    }
  });

  /* =========================
     RENDER
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
          <p className="kpi-card-value">₹{totalIncome.toLocaleString("en-IN")}</p>
          <span className="kpi-card-sub">Academic Year {academicYear}</span>
        </div>

        {/* Total Expense */}
        <div className="kpi-card-primary kpi-expense">
          <div className="kpi-card-top">
            <div className="kpi-card-icon">💸</div>
            <div className="kpi-card-arrow">↗</div>
          </div>
          <div className="kpi-card-label">Total Expense</div>
          <p className="kpi-card-value">₹{totalExpense.toLocaleString("en-IN")}</p>
          <span className="kpi-card-sub">Academic Year {academicYear}</span>
        </div>

        {/* Net Balance */}
        <div className="kpi-card-primary kpi-balance">
          <div className="kpi-card-top">
            <div className="kpi-card-icon">⚖️</div>
            <div className="kpi-card-arrow">↗</div>
          </div>
          <div className="kpi-card-label">Net Balance</div>
          <p className="kpi-card-value">₹{netBalance.toLocaleString("en-IN")}</p>
          <span className="kpi-card-sub">Income − Expense</span>
        </div>

      </div>

      {/* ═══════════════════════════════════
          ROW 2 — Secondary Cards + Calendar
      ═══════════════════════════════════ */}
      <div className="kpi-body-row">

        {/* Left: 2×2 secondary cards */}
        <div className="kpi-secondary-grid">

          {/* Latest Month Income */}
          <div className="kpi-card-secondary sec-income">
            <div className="kpi-sec-blob" />
            <div className="kpi-sec-top">
              <div className="kpi-sec-label">Latest Month's Income</div>
              <div className="kpi-sec-icon">💰</div>
            </div>
            <p className="kpi-sec-value">₹{monthIncome.toLocaleString("en-IN")}</p>
            <span className="kpi-sec-badge badge-income">↑ Derived from year data</span>
          </div>

          {/* Latest Month Expense */}
          <div className="kpi-card-secondary sec-expense">
            <div className="kpi-sec-blob" />
            <div className="kpi-sec-top">
              <div className="kpi-sec-label">Latest Month's Expense</div>
              <div className="kpi-sec-icon">💸</div>
            </div>
            <p className="kpi-sec-value">₹{monthExpense.toLocaleString("en-IN")}</p>
            <span className="kpi-sec-badge badge-expense">↓ Derived from year data</span>
          </div>

          {/* Total Pending Fees */}
          <div className="kpi-card-secondary sec-fees">
            <div className="kpi-sec-blob" />
            <div className="kpi-sec-top">
              <div className="kpi-sec-label">Total Pending Fees</div>
              <div className="kpi-sec-icon">⚠️</div>
            </div>
            <p className="kpi-sec-value">₹{totalPending.toLocaleString("en-IN")}</p>
            <span className="kpi-sec-badge badge-fees">⚠ Academic Year {academicYear}</span>
          </div>

          {/* Students with Dues */}
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
            <p className="kpi-sec-value">{studentsWithPending}</p>
            <span className="kpi-sec-badge badge-dues">● Pending fee ledgers</span>
          </div>

        </div>

        {/* Right: Calendar widget */}
        <CalendarKPI />

      </div>

    </div>
  );
}

export default DashboardKPIs;