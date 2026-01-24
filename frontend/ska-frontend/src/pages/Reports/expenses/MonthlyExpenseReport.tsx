// src/pages/Reports/expenses/MonthlyExpenseReport.tsx

import { useFeeLedger } from "../../../context/FeeLedgerContext";
import { getAcademicYearRange } from "../Utils/reportDateUtils";
import "./expenseReports.css";
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

    const { start, end } = getAcademicYearRange(academicYear);

    const monthlyExpenses = expenses.filter((e) => {
        const d = new Date(e.expenseDate);
        return (
            d >= start &&
            d <= end &&
            d.getMonth() === selectedMonth
        );
    });

    if (monthlyExpenses.length === 0) {
        return <p>No expenses recorded for this month.</p>;
    }

    const totalExpense = monthlyExpenses.reduce(
        (sum, e) => sum + e.amount,
        0
    );

    const categoryTotals = monthlyExpenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
    }, {} as Record<string, number>);

    const monthLabel = new Date(2026, selectedMonth).toLocaleString(
        "default",
        { month: "long" }
    );

    const printData = {
        title: "Monthly Expense Report",
        meta: {
            academicYear,
            reportType: "EXPENSE",
            granularity: "MONTHLY",
            periodLabel: monthLabel, // e.g. "January"
        },
        sections: [
            {
                title: "Expense Details",
                headers: ["Date", "Category", "Amount"],
                rows: monthlyExpenses.map((e) => ({
                    columns: [
                        new Date(e.expenseDate).toLocaleDateString(),
                        e.category,
                        `₹${e.amount}`,
                    ],
                })),
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
                    {monthlyExpenses.map((e) => (
                        <tr key={e.id}>
                            <td>{new Date(e.expenseDate).toLocaleDateString()}</td>
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
                        {Object.entries(categoryTotals).map(
                            ([cat, amt]) => (
                                <tr key={cat}>
                                    <td>{cat}</td>
                                    <td className="amount">₹{amt}</td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>

                <p className="total-line">
                    <strong>Total Expense:</strong> ₹{totalExpense}
                </p>
                <button className="print-btn" onClick={() => printReport(printData)}>
                    Print / Save as PDF
                </button>

            </div>
        </div>
    );
}

export default MonthlyExpenseReport;
