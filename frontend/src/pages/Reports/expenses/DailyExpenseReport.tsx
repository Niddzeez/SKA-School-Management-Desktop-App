import { useMemo } from "react";
import { useFeeLedger } from "../../../context/FeeLedgerContext";
import { getAcademicYearRange } from "../Utils/reportDateUtils";
import "../../../components/print/report-print.css";
import { printReport } from "../Utils/PrintUtils";

type Props = {
    academicYear: string;
    selectedDate: string | null; // yyyy-mm-dd
};

function DailyExpenseReport({ academicYear, selectedDate }: Props) {
    const { expenses } = useFeeLedger();

    if (!selectedDate) {
        return <p>Please select a date.</p>;
    }

    const { start, end } = getAcademicYearRange(academicYear);
    const target = new Date(selectedDate);

    /* =========================
       Academic Year Validation
    ========================= */

    if (target < start || target > end) {
        return (
            <p>
                Selected date does not belong to academic year {academicYear}.
            </p>
        );
    }

    /* =========================
       Filter Daily Expenses
    ========================= */

    const dailyExpenses = useMemo(() => {
        return expenses.filter((e) => {
            const d = new Date(e.expenseDate);
            return d.toDateString() === target.toDateString();
        });
    }, [expenses, selectedDate]);

    if (dailyExpenses.length === 0) {
        return <p>No expenses recorded on this date.</p>;
    }

    /* =========================
       Totals
    ========================= */

    const totalExpense = dailyExpenses.reduce(
        (sum, e) => sum + e.amount,
        0
    );

    /* =========================
       Print Data
    ========================= */

    const printData = {
        title: "Daily Expense Report",
        meta: {
            academicYear,
            reportType: "EXPENSE",
            granularity: "DAILY",
            periodLabel: target.toLocaleDateString(),
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
                rows: dailyExpenses.map((e) => ({
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
                    {
                        columns: ["Total Expense", `₹${totalExpense}`],
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
                Daily Expense Report — {target.toLocaleDateString()}
            </h3>

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
                    {dailyExpenses.map((e) => (
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
    );
}

export default DailyExpenseReport;