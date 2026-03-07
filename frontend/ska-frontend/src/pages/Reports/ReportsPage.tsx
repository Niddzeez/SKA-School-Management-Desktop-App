import { useState, useEffect } from "react";
import { useAcademicYear } from "../../context/AcademicYearContext";
import { useAuth } from "../../context/AuthContext";
import { can } from "../../auth/permissions"
import { Navigate } from "react-router-dom";

/* Filters */
import ReportTypeSelector from "./Filters/ReportTypeSelector";
import TimeRangeSelector from "./Filters/TimeRangeSelector";
import AcademicYearSelector from "./Filters/AcademicYearSelector";

/* Unified Reports */
import IncomeReport from "./Income/IncomeReport";
import ExpenseReport from "./expenses/ExpenseReport";
import CombinedReport from "./combined/CombinedReport";

import "./ReportsPage.css";
import YearEndStatement from "./Statements/YearEndStatement";
import { getAcademicYearRange } from "./Utils/reportDateUtils";

type ReportGranularity = "DAILY" | "MONTHLY" | "HALF_YEARLY" | "YEARLY";
type ReportCategory = "INCOME" | "EXPENSE" | "COMBINED";

function ReportsPage() {

    const { role } = useAuth();

    if (!role || !can(role, "VIEW_REPORTS")) {
        return <Navigate to="/students" replace />;
    }

    const [granularity, setGranularity] =
        useState<ReportGranularity>("MONTHLY");

    const [category, setCategory] =
        useState<ReportCategory>("EXPENSE");

    const { activeYear } = useAcademicYear();

    const [academicYear, setAcademicYear] =
        useState<string>("");

    useEffect(() => {
        if (activeYear?.id && !academicYear) {
            setAcademicYear(activeYear.id);
        }
    }, [activeYear?.id, academicYear]);

    const [selectedDate, setSelectedDate] =
        useState<string | null>(null);

    const [selectedMonth, setSelectedMonth] =
        useState<number | null>(null);

    const [half, setHalf] =
        useState<"H1" | "H2" | null>(null);

    // Compute Date Boundaries based on selections
    const computeDateBoundaries = () => {
        const { start, end } = getAcademicYearRange(academicYear);
        let fromDateStr: string | undefined;
        let toDateStr: string | undefined;
        let periodLabel = academicYear;

        if (granularity === "DAILY") {
            if (selectedDate) {
                fromDateStr = selectedDate;
                toDateStr = selectedDate;
                periodLabel = new Date(selectedDate).toLocaleDateString();
            } else {
                return null;
            }
        } else if (granularity === "MONTHLY") {
            if (selectedMonth !== null) {
                // Approximate monthly bounds; since backend queries map strictly < interval + 1 Day, calculating the precise bounds explicitly saves SQL complexity.
                const startYear = start.getFullYear();
                const actualYear = selectedMonth >= 3 ? startYear : startYear + 1; // Apending offset assuming Indian academic scale, April to March

                const fm = new Date(actualYear, selectedMonth, 1);
                const tm = new Date(actualYear, selectedMonth + 1, 0); // Last day of month

                fromDateStr = fm.toISOString().split("T")[0];
                toDateStr = tm.toISOString().split("T")[0];
                periodLabel = fm.toLocaleString("default", { month: "long", year: "numeric" });
            } else {
                return null; // Awaiting month selection
            }
        } else if (granularity === "HALF_YEARLY") {
            if (half) {
                if (half === "H1") {
                    fromDateStr = start.toISOString().split("T")[0];
                    const endH1 = new Date(start.getFullYear(), 8, 30); // End September
                    toDateStr = endH1.toISOString().split("T")[0];
                    periodLabel = "First Half (H1)";
                } else {
                    const startH2 = new Date(start.getFullYear(), 9, 1); // Start October
                    fromDateStr = startH2.toISOString().split("T")[0];
                    toDateStr = end.toISOString().split("T")[0];
                    periodLabel = "Second Half (H2)";
                }
            } else {
                return null;
            }
        } else if (granularity === "YEARLY") {
            // Leave fromDate / toDate empty to span the entire academic year dynamically inside the backend
            periodLabel = `Academic Year ${academicYear}`;
        }

        return { fromDateStr, toDateStr, periodLabel };
    };

    const boundaries = computeDateBoundaries();

    return (
        <div className="reports-page">
            <h2>Reports</h2>

            {/* ================= Filters ================= */}

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

            {/* ================= Output ================= */}

            <div className="reports-output">
                <p className="reports-meta">
                    <strong>Selected:</strong>{" "}
                    {category} · {granularity} · {academicYear}
                </p>

                {boundaries ? (
                    <>
                        {category === "INCOME" && (
                            <IncomeReport
                                academicYear={academicYear}
                                fromDate={boundaries.fromDateStr}
                                toDate={boundaries.toDateStr}
                                periodLabel={boundaries.periodLabel}
                            />
                        )}
                        {category === "EXPENSE" && (
                            <ExpenseReport
                                academicYear={academicYear}
                                fromDate={boundaries.fromDateStr}
                                toDate={boundaries.toDateStr}
                                periodLabel={boundaries.periodLabel}
                            />
                        )}
                        {category === "COMBINED" && (
                            <CombinedReport
                                academicYear={academicYear}
                                fromDate={boundaries.fromDateStr}
                                toDate={boundaries.toDateStr}
                                periodLabel={boundaries.periodLabel}
                            />
                        )}
                    </>
                ) : (
                    <p>Please select the required time parameter to view the report.</p>
                )}
            </div>

            {!role || can(role, "VIEW_REPORTS") && <YearEndStatement />}
        </div>
    );
}

export default ReportsPage;
