import { useMemo } from "react";
import { useFeeLedger } from "../../../context/FeeLedgerContext";
import { getAcademicYearRange } from "../Utils/reportDateUtils";
import "../../../components/print/report-print.css";
import { printReport } from "../Utils/printUtils";

type Props = {
    academicYear: string;
    selectedMonth: number | null; // 0 = Jan
};

function MonthlyExpenseReport({ academicYear, selectedMonth }: Props) {
    const { expenses } = useFeeLedger();

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
       Filter Monthly Expenses
    ========================= */

    const monthlyExpenses = useMemo(() => {
        return expenses.filter((e) => {
            const d = new Date(e.expenseDate);
            return d >= monthStart && d <= monthEnd;
        });
    }, [expenses, monthStart, monthEnd]);

    if (monthlyExpenses.length === 0) {
        return <p>No expenses recorded for this month.</p>;
    }

    /* =========================
       Totals
    ========================= */

    const totalExpense = monthlyExpenses.reduce(
        (sum, e) => sum + e.amount,
        0
    );

    const categoryTotals = monthlyExpenses.reduce(
        (acc, e) => {
            acc[e.category] = (acc[e.category] || 0) + e.amount;
            return acc;
        },
        {} as Record<string, number>
    );

    /* =========================
       Print Data
    ========================= */

    const printData = {
        title: "Monthly Expense Report",
        meta: {
            academicYear,
            reportType: "EXPENSE",
            granularity: "MONTHLY",
            periodLabel: monthLabel,
        },
        sections: [
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
                title: "Category Summary",
                headers: ["Category", "Amount"],
                rows: Object.entries(categoryTotals).map(
                    ([cat, amt]) => ({
                        columns: [cat, `₹${amt}`],
                    })
                ),
            },
            {
                title: "Summary",
                headers: ["Metric", "Value"],
                rows: [
                    {
                        columns: ["Total Expense", `₹${totalExpense}`],
                    },
                ],
            },
        ],
    } as const;

    return (
        <div className="report-card">
            <h3>
                Monthly Expense Report — {monthLabel} {academicYear}
            </h3>

            {/* Expense Table */}
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
                    {monthlyExpenses.map((e, index) => (
                        <tr key={`${e.id}-${index}`}>
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

            {/* Category Summary */}
            <div className="report-summary">
                <h4>Category-wise Summary</h4>

                <table className="summary-table">
                    <tbody>
                        {monthlyExpenses.map((e, index) => (
                            <tr key={`${e.id}-${index}`}>
                                <td>
                                    {e.expenseDate
                                        ? new Date(e.expenseDate).toLocaleDateString()
                                        : "-"}
                                </td>
                                <td>{e.category}</td>
                                <td>{e.description}</td>
                                <td>{e.paidTo}</td>
                                <td className="amount">₹{e.amount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <p className="total-line">
                    <strong>Total Expense:</strong> ₹{totalExpense}
                </p>

                <button
                    className="print-btn"
                    onClick={() => printReport(printData)}
                >
                    Print / Save as PDF
                </button>
            </div>
        </div>
    );
}

export default MonthlyExpenseReport;