import { useState } from "react";
import { CURRENT_YEAR } from "../../context/AcademicYearContext";
import { useAuth } from "../../context/AuthContext";
import { can } from "../../auth/permissions";
import { Navigate } from "react-router-dom";

/* Filters */
import ReportTypeSelector from "./Filters/ReportTypeSelector";
import TimeRangeSelector from "./Filters/TimeRangeSelector";
import AcademicYearSelector from "./Filters/AcademicYearSelector";

/* Income Reports */
import DailyIncomeReport from "./Income/DailyIncomeReport";
import MonthlyIncomeReport from "./Income/MonthlyIncomeReport";
import HalfYearlyIncomeReport from "./Income/HalfYearlyIncomeReport";
import YearlyIncomeReport from "./Income/YearlyIncomeReport";

/* Expense Reports */
import DailyExpenseReport from "./expenses/DailyExpenseReport";
import MonthlyExpenseReport from "./expenses/MonthlyExpenseReport";
import HalfYearlyExpenseReport from "./expenses/HalfYearlyExpenseReport";
import YearlyExpenseReport from "./expenses/YearlyExpenseReport";

/* Combined Reports */
import DailyIncomeVsExpense from "./combined/DailyIncomeVsExpenseReport";
import MonthlyIncomeVsExpense from "./combined/MonthlyIncomevsExpenseReport";
import HalfYearlyIncomeVsExpense from "./combined/HalfYearlyIncomeVsExpenseReport";
import YearlyIncomeVsExpense from "./combined/YearlyIncomeVsExpense";

import "./ReportsPage.css";
import YearEndStatement from "./Statements/YearEndStatement";

type ReportGranularity = "DAILY" | "MONTHLY" | "HALF_YEARLY" | "YEARLY";
type ReportCategory    = "INCOME" | "EXPENSE" | "COMBINED";

function ReportsPage() {
  const { role } = useAuth();

  if (!role || !can(role, "VIEW_REPORTS")) {
    return <Navigate to="/students" replace />;
  }

  const [granularity, setGranularity] = useState<ReportGranularity>("MONTHLY");
  const [category,    setCategory]    = useState<ReportCategory>("EXPENSE");
  const [academicYear, setAcademicYear] = useState<string>(CURRENT_YEAR);
  const [selectedDate,  setSelectedDate]  = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [half, setHalf] = useState<"H1" | "H2" | null>(null);

  /* Badge colour helper */
  const categoryClass    = category.toLowerCase();
  const granularityLabel = granularity.replace("_", " ");

  return (
    <div className="reports-page">

      {/* ── Page header ── */}
      <div className="reports-page-header">
        <h1 className="reports-page-title">Reports</h1>
        <p className="reports-page-sub">Financial overview · Smart Kids Academy</p>
      </div>

      {/* ── Single connected card ── */}
      <div className="reports-card">

        {/* Gradient header */}
        <div className="reports-card-header">
          <div>
            <div className="reports-header-title">Year-End Financial Statement</div>
            <div className="reports-header-sub">Smart Kids Academy · Academic Reports</div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="reports-filters">
          <ReportTypeSelector
            granularity={granularity}
            category={category}
            onGranularityChange={setGranularity}
            onCategoryChange={setCategory}
          />
          <AcademicYearSelector
            academicYear={academicYear}
            onChange={setAcademicYear}
          />
          <TimeRangeSelector
            granularity={granularity}
            selectedDate={selectedDate}
            selectedMonth={selectedMonth}
            half={half}
            onDateChange={setSelectedDate}
            onMonthChange={setSelectedMonth}
            onHalfChange={setHalf}
          />
        </div>

        {/* Active filter badge bar */}
        <div className="reports-meta-bar">
          <span className="reports-meta-label">Selected:</span>
          <span className={`reports-meta-badge category`}>{category}</span>
          <span className="reports-meta-dot">·</span>
          <span className="reports-meta-badge granularity">{granularityLabel}</span>
          <span className="reports-meta-dot">·</span>
          <span className="reports-meta-badge year">{academicYear}</span>
        </div>

        {/* Report output */}
        <div className="reports-output">

          {/* ── DAILY ── */}
          {granularity === "DAILY" && category === "INCOME" && selectedDate && (
            <DailyIncomeReport academicYear={academicYear} selectedDate={selectedDate} />
          )}
          {granularity === "DAILY" && category === "EXPENSE" && selectedDate && (
            <DailyExpenseReport academicYear={academicYear} selectedDate={selectedDate} />
          )}
          {granularity === "DAILY" && category === "COMBINED" && selectedDate && (
            <DailyIncomeVsExpense academicYear={academicYear} selectedDate={selectedDate} />
          )}

          {/* ── MONTHLY ── */}
          {granularity === "MONTHLY" && category === "INCOME" && selectedMonth !== null && (
            <MonthlyIncomeReport academicYear={academicYear} selectedMonth={selectedMonth} />
          )}
          {granularity === "MONTHLY" && category === "EXPENSE" && selectedMonth !== null && (
            <MonthlyExpenseReport academicYear={academicYear} selectedMonth={selectedMonth} />
          )}
          {granularity === "MONTHLY" && category === "COMBINED" && selectedMonth !== null && (
            <MonthlyIncomeVsExpense academicYear={academicYear} selectedMonth={selectedMonth} />
          )}

          {/* ── HALF YEARLY ── */}
          {granularity === "HALF_YEARLY" && category === "INCOME" && half && (
            <HalfYearlyIncomeReport academicYear={academicYear} half={half} />
          )}
          {granularity === "HALF_YEARLY" && category === "EXPENSE" && half && (
            <HalfYearlyExpenseReport academicYear={academicYear} half={half} />
          )}
          {granularity === "HALF_YEARLY" && category === "COMBINED" && half && (
            <HalfYearlyIncomeVsExpense academicYear={academicYear} half={half} />
          )}

          {/* ── YEARLY ── */}
          {granularity === "YEARLY" && category === "INCOME" && (
            <YearlyIncomeReport academicYear={academicYear} />
          )}
          {granularity === "YEARLY" && category === "EXPENSE" && (
            <YearlyExpenseReport academicYear={academicYear} />
          )}
          {granularity === "YEARLY" && category === "COMBINED" && (
            <YearlyIncomeVsExpense academicYear={academicYear} />
          )}

          {/* ── Year-end statement ── */}
          {(!role || can(role, "VIEW_REPORTS")) && <YearEndStatement />}

        </div>
      </div>
    </div>
  );
}

export default ReportsPage;