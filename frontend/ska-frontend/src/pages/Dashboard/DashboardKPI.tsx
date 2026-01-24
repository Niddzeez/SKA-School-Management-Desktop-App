import { useFeeLedger } from "../../context/FeeLedgerContext";
import { useAcademicYear } from "../../context/AcademicYearContext";
import { getAcademicYearRange } from "../Reports/Utils/reportDateUtils";
import "./dashboard.css";
import { useNavigate } from "react-router-dom";


function DashboardKPIs() {
    const { payments, expenses, ledgers, getLedgerSummary } = useFeeLedger();
    const { academicYear } = useAcademicYear();
    const navigate = useNavigate();

    /* =========================
       Academic Year Range
       (same helper as reports)
    ========================= */

    const { start, end } = getAcademicYearRange(academicYear);

    /* =========================
       TOTALS (YEARLY)
       EXACT SAME PATTERN AS REPORTS
    ========================= */

    let totalIncome = 0;
    let totalExpense = 0;

    payments.forEach((p) => {
        const d = new Date(p.createdAt);
        if (d >= start && d <= end) {
            totalIncome += p.amount;
        }
    });

    expenses.forEach((e) => {
        const d = new Date(e.expenseDate);
        if (d >= start && d <= end) {
            totalExpense += e.amount;
        }
    });

    const netBalance = totalIncome - totalExpense;

    /* =========================
       MONTH LOGIC — COPY REPORT THINKING
       Pick latest month WITH DATA inside AY
    ========================= */

    let referenceMonth: number | null = null;

    payments.forEach((p) => {
        const d = new Date(p.createdAt);
        if (d >= start && d <= end) {
            referenceMonth = d.getMonth();
        }
    });

    expenses.forEach((e) => {
        const d = new Date(e.expenseDate);
        if (d >= start && d <= end) {
            referenceMonth = d.getMonth();
        }
    });

    let monthIncome = 0;
    let monthExpense = 0;

    if (referenceMonth !== null) {
        payments.forEach((p) => {
            const d = new Date(p.createdAt);
            if (
                d >= start &&
                d <= end &&
                d.getMonth() === referenceMonth
            ) {
                monthIncome += p.amount;
            }
        });

        expenses.forEach((e) => {
            const d = new Date(e.expenseDate);
            if (
                d >= start &&
                d <= end &&
                d.getMonth() === referenceMonth
            ) {
                monthExpense += e.amount;
            }
        });
    }

    /* =========================
       Pending Fees KPIs
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



    console.log("AY:", academicYear);
    console.log("Payments:", payments.length, payments[0]);
    console.log("Expenses:", expenses.length, expenses[0]);
    console.log("AY Range:", start, end);


    /* =========================
       Render
    ========================= */

    return (
        <div className="dashboard-kpis">
            <div className="kpi-row">
                <div className="kpi-card income">
                    <h4>Total Income</h4>
                    <p className="kpi-value">₹{totalIncome}</p>
                    <span className="kpi-sub">
                        Academic Year {academicYear}
                    </span>
                </div>

                <div className="kpi-card expense">
                    <h4>Total Expense</h4>
                    <p className="kpi-value">₹{totalExpense}</p>
                    <span className="kpi-sub">
                        Academic Year {academicYear}
                    </span>
                </div>

                <div className="kpi-card balance">
                    <h4>Net Balance</h4>
                    <p
                        className={`kpi-value ${netBalance >= 0 ? "positive" : "negative"
                            }`}
                    >
                        ₹{netBalance}
                    </p>
                    <span className="kpi-sub">
                        Income − Expense
                    </span>
                </div>
            </div>

            <div className="kpi-row">
                <div className="kpi-card income">
                    <h4>Latest Month’s Income</h4>
                    <p className="kpi-value">₹{monthIncome}</p>
                    <span className="kpi-sub">
                        Derived from academic year data
                    </span>
                </div>

                <div className="kpi-card expense">
                    <h4>Latest Month’s Expense</h4>
                    <p className="kpi-value">₹{monthExpense}</p>
                    <span className="kpi-sub">
                        Derived from academic year data
                    </span>
                </div>
            </div>
            <div className="kpi-row">
                <div className="kpi-card warning">
                    <h4>Total Pending Fees</h4>
                    <p className="kpi-value">₹{totalPending}</p>
                    <span className="kpi-sub">
                        Academic Year {academicYear}
                    </span>
                </div>

                <div className="kpi-card warning"   onClick={() => navigate("/dashboard/pending-fees")}>
                    <h4>Students with Dues</h4>
                    <p className="kpi-value">{studentsWithPending}</p>
                    <span className="kpi-sub">
                        Pending fee ledgers
                    </span>
                </div>
            </div>

        </div>
    );
}

export default DashboardKPIs;
