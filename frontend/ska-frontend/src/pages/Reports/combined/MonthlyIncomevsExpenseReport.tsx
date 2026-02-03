// src/pages/Reports/combined/MonthlyIncomeVsExpense.tsx

import { useFeeLedger } from "../../../context/FeeLedgerContext";
import { getAcademicYearRange } from "../Utils/reportDateUtils";
import "../../../components/print/report-print.css";
import { printReport } from "../Utils/PrintUtils";
import { useStudents } from "../../../context/StudentContext";


type Props = {
    academicYear: string;
    selectedMonth: number | null; // 0 = Jan
};

function MonthlyIncomeVsExpense({


    academicYear,
    selectedMonth,
}: Props) {
    const { payments, expenses } = useFeeLedger();

    if (selectedMonth === null) {
        return <p>Please select a month.</p>;
    }

    const { start, end } = getAcademicYearRange(academicYear);
    const { students } = useStudents();

    /* =========================
       Filter Data
    ========================= */

    const monthlyIncome = payments.filter((p) => {
        const d = new Date(p.createdAt);
        return (
            d >= start &&
            d <= end &&
            d.getMonth() === selectedMonth
        );
    });

    const monthlyExpenses = expenses.filter((e) => {
        const d = new Date(e.expenseDate);
        return (
            d >= start &&
            d <= end &&
            d.getMonth() === selectedMonth
        );
    });

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

    const monthLabel = new Date(2026, selectedMonth).toLocaleString(
        "default",
        { month: "long" }
    );

    const getStudentName = (studentId: string) => {
        const s = students.find((st) => st.id === studentId);
        return s ? `${s.firstName} ${s.lastName}` : "Unknown";
    };

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
                headers: ["Date", "Student", "Mode", "Amount"],
                rows: monthlyIncome.map((p) => ({
                    columns: [
                        new Date(p.createdAt).toLocaleDateString(),
                        getStudentName(p.studentId),
                        p.mode,
                        `₹${p.amount}`,
                    ],
                })),
            },

            {
                title: "Expense Details",
                headers: ["Date", "Category", "Paid To", "Amount"],
                rows: monthlyExpenses.map((e) => ({
                    columns: [
                        new Date(e.expenseDate).toLocaleDateString(),
                        e.category,
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
                    {
                        columns: ["Net Result", `₹${totalIncome - totalExpense}`],
                    },
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

            {/* =========================
          Income Section
      ========================= */}
            <div className="section">
                <h4>Income</h4>

                {monthlyIncome.length === 0 ? (
                    <p>No income recorded.</p>
                ) : (
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>Date</th>
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

            {/* =========================
          Expense Section
      ========================= */}
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

            {/* =========================
          Net Summary
      ========================= */}
            <div
                className={`net-summary ${netBalance >= 0 ? "positive" : "negative"
                    }`}
            >
                Net Balance: ₹{netBalance}
            </div>

            <button className="print-btn" onClick={() => printReport(printData)}>
                Print / Save as PDF
            </button>

        </div>
    );
}

export default MonthlyIncomeVsExpense;
