import { useMemo } from "react";
import { useFeeLedger } from "../../../context/FeeLedgerContext";
import { useStudents } from "../../../context/StudentContext";
import { getAcademicYearRange } from "../Utils/reportDateUtils";
import { printReport } from "../Utils/printUtils";
import "../../../components/print/report-print.css";

type Props = {
    academicYear: string;
    selectedMonth: number | null; // 0 = Jan
};

function MonthlyIncomeVsExpense({
    academicYear,
    selectedMonth,
}: Props) {
    const { payments, expenses } = useFeeLedger();
    const { students } = useStudents();

    if (selectedMonth === null) {
        return <p>Please select a month.</p>;
    }

    const { start } = getAcademicYearRange(academicYear);

    /* =========================
       Correct Academic Month
    ========================= */

    const startYear = start.getFullYear();
    const actualYear =
        selectedMonth >= 3 ? startYear : startYear + 1;

    const monthStart = new Date(actualYear, selectedMonth, 1);
    const monthEnd = new Date(actualYear, selectedMonth + 1, 0);

    const monthLabel = monthStart.toLocaleString("default", {
        month: "long",
    });

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
       Filter Data
    ========================= */

    const monthlyIncome = useMemo(() => {
        return payments.filter((p) => {
            const d = new Date(p.createdAt);
            return d >= monthStart && d <= monthEnd;
        });
    }, [payments, monthStart, monthEnd]);

    const monthlyExpenses = useMemo(() => {
        return expenses.filter((e) => {
            const d = new Date(e.expenseDate);
            return d >= monthStart && d <= monthEnd;
        });
    }, [expenses, monthStart, monthEnd]);

    if (monthlyIncome.length === 0 && monthlyExpenses.length === 0) {
        return <p>No income or expenses for this month.</p>;
    }

    /* =========================
       Totals
    ========================= */

    const totalIncome = monthlyIncome.reduce(
        (sum, p) => sum + p.amount,
        0
    );

    const totalExpense = monthlyExpenses.reduce(
        (sum, e) => sum + e.amount,
        0
    );

    const netBalance = totalIncome - totalExpense;

    /* =========================
       Print Data
    ========================= */

    const printData = {
        title: "Monthly Income vs Expense Report",
        meta: {
            academicYear,
            reportType: "COMBINED",
            granularity: "MONTHLY",
            periodLabel: monthLabel,
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
                rows: monthlyIncome.map((p) => ({
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
                    "Amount",
                ],
                rows: monthlyExpenses.map((e) => ({
                    columns: [
                        new Date(e.expenseDate).toLocaleDateString(),
                        e.category,
                        e.description,
                        e.paidTo,
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
                    { columns: ["Net Result", `₹${netBalance}`] },
                ],
            },
        ],
    } as const;

    /* =========================
       Render
    ========================= */

    return (
        <div className="report-card">
            <h3>
                Monthly Income vs Expense — {monthLabel} {academicYear}
            </h3>

            {/* Income */}
            <div className="section">
                <h4>Income</h4>

                {monthlyIncome.length === 0 ? (
                    <p>No income recorded.</p>
                ) : (
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
                            {monthlyIncome.map((p) => (
                                <tr key={p.id}>
                                    <td>
                                        {new Date(p.createdAt).toLocaleDateString()}
                                    </td>
                                    <td>{getStudentName(p.studentId)}</td>
                                    <td>{p.mode}</td>
                                    <td>{p.collectedBy}</td>
                                    <td className="amount">₹{p.amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <p className="total-line">
                    <strong>Total Income:</strong> ₹{totalIncome}
                </p>
            </div>

            {/* Expenses */}
            <div className="section">
                <h4>Expenses</h4>

                {monthlyExpenses.length === 0 ? (
                    <p>No expenses recorded.</p>
                ) : (
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Paid To</th>
                                <th>Amount</th>
                            </tr>
                        </thead>

                        <tbody>
                            {monthlyExpenses.map((e) => (
                                <tr key={e.id}>
                                    <td>
                                        {new Date(e.expenseDate).toLocaleDateString()}
                                    </td>
                                    <td>{e.category}</td>
                                    <td>{e.description}</td>
                                    <td>{e.paidTo}</td>
                                    <td className="amount">₹{e.amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <p className="total-line">
                    <strong>Total Expense:</strong> ₹{totalExpense}
                </p>
            </div>

            {/* Net Summary */}
            <div
                className={`net-summary ${netBalance >= 0 ? "positive" : "negative"
                    }`}
            >
                Net Balance: ₹{netBalance}
            </div>

            <button
                className="print-btn"
                onClick={() => printReport(printData)}
            >
                Print / Save as PDF
            </button>
        </div>
    );
}

export default MonthlyIncomeVsExpense;