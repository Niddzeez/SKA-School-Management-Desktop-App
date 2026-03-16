import { useEffect, useState } from "react";
import { apiClient } from "../../../services/apiClient";
import "../../../components/print/report-print.css";
import { printReport } from "../Utils/PrintUtils";
import { toBackendAcademicYear } from "../Utils/reportDateUtils";

type Props = {
    academicYear: string;
    fromDate?: string;
    toDate?: string;
    periodLabel: string;
};

interface ExpenseRow {
    id: string;
    category: string;
    description: string;
    amount: number;
    expense_date: string;
    paid_to: string;
    mode: string;
    recorded_by: string;
    reference: string | null;
}

interface ExpenseReportData {
    totalExpenses: number;
    expenses: ExpenseRow[];
}

function ExpenseReport({
    academicYear,
    fromDate,
    toDate,
    periodLabel,
}: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<ExpenseReportData | null>(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                setLoading(true);
                setError(null);

                const params = new URLSearchParams({ year: toBackendAcademicYear(academicYear) });

                if (fromDate) params.append("fromDate", fromDate);
                if (toDate) params.append("toDate", toDate);

                const res = await apiClient.get<ExpenseReportData>(
                    `/api/reports/expenses?${params.toString()}`
                );

                setData(res);
            } catch (err: any) {
                setError(err?.message ?? "Failed to load expense report");
            } finally {
                setLoading(false);
            }
        };

        if (academicYear) {
            fetchReport();
        }
    }, [academicYear, fromDate, toDate]);

    if (loading) return <p>Loading expense report...</p>;
    if (error) return <p className="error">{error}</p>;
    if (!data) return null;

    const printData = {
        title: `Expense Report — ${periodLabel}`,
        meta: {
            academicYear,
            reportType: "EXPENSE",
            periodLabel,
        },
        sections: [
            {
                title: "Expense Details",
                headers: [
                    "Date",
                    "Category",
                    "Description",
                    "Paid To",
                    "Mode",
                    "Amount",
                ],
                rows: data.expenses.map((e) => ({
                    columns: [
                        new Date(e.expense_date).toLocaleDateString(),
                        e.category,
                        e.description,
                        e.paid_to,
                        e.mode,
                        `₹${e.amount}`,
                    ],
                })),
            },
            {
                title: "Summary",
                headers: ["Metric", "Value"],
                rows: [
                    {
                        columns: ["Total Expense", `₹${data.totalExpenses}`],
                    },
                ],
            },
        ],
    } as const;

    return (
        <div className="report-card">
            <h3>
                Expense Report — {periodLabel} ({academicYear})
            </h3>

            <div className="section">
                <h4>Expenses</h4>

                {data.expenses.length === 0 ? (
                    <p>No expenses recorded.</p>
                ) : (
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Paid To</th>
                                <th>Mode</th>
                                <th>Amount</th>
                            </tr>
                        </thead>

                        <tbody>
                            {data.expenses.map((e) => (
                                <tr key={e.id}>
                                    <td>
                                        {new Date(e.expense_date).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <span className="badge category-badge">
                                            {e.category}
                                        </span>
                                    </td>
                                    <td>{e.description}</td>
                                    <td>{e.paid_to}</td>
                                    <td>{e.mode}</td>
                                    <td className="amount">₹{e.amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <p className="total-line">
                    <strong>Total Expense:</strong> ₹{data.totalExpenses}
                </p>
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

export default ExpenseReport;