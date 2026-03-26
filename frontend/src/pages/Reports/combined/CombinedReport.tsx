
import { useEffect, useState } from "react";
import { apiClient } from "../../../services/apiClient";
import "../../../components/print/report-print.css";
import { printReport } from "../Utils/PrintUtils";
import { toShortAcademicYear } from "../Utils/reportDateUtils";

type Props = {
    academicYear: string;
    fromDate?: string;
    toDate?: string;
    periodLabel: string;
};

interface IncomeRow {
    id: string;
    studentName: string;
    amount: number;
    mode: string;
    collected_by: string;
    created_at: string;
}

interface ExpenseRow {
    id: string;
    category: string;
    description: string;
    paid_to: string;
    amount: number;
    mode: string;
    expense_date: string;
}

interface CombinedReportData {
    incomeTotal: number;
    expenseTotal: number;
    netBalance: number;

    incomes: IncomeRow[];
    expenses: ExpenseRow[];
}

function CombinedReport({
    academicYear,
    fromDate,
    toDate,
    periodLabel,
}: Props) {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<CombinedReportData | null>(null);

    useEffect(() => {

        if (!academicYear) return;

        const fetchReport = async () => {

            try {

                setLoading(true);
                setError(null);

                const params = new URLSearchParams();
                params.append("year", toShortAcademicYear(academicYear));

                if (fromDate) params.append("fromDate", fromDate);
                if (toDate) params.append("toDate", toDate);

                const res = await apiClient.get<CombinedReportData>(
                    `/api/reports/combined?${params.toString()}`
                );

                setData(res);

            } catch (err: any) {

                setError(err?.message ?? "Failed to load combined report");

            } finally {

                setLoading(false);

            }

        };

        fetchReport();

    }, [academicYear, fromDate, toDate]);

    if (loading) return <p>Loading combined report...</p>;
    if (error) return <p className="error">{error}</p>;
    if (!data) return null;
    console.log("INCOME DATA:", data.incomes);

    const categorySummaryMap = data.expenses.reduce((acc, e) => {
        const amount = Number(e.amount); // 🔥 FORCE NUMBER

        if (!acc[e.category]) {
            acc[e.category] = 0;
        }

        acc[e.category] += amount;

        return acc;
    }, {} as Record<string, number>);

    const categorySummary = Object.entries(categorySummaryMap)
        .map(([category, total]) => ({
            category,
            total,
        }))
        .sort((a, b) => b.total - a.total); // optional sorting
    /* =========================
       Print Data
    ========================= */

    const printData = {

        title: `Income vs Expense Report — ${periodLabel}`,

        meta: {
            academicYear: academicYear || "Unknown Year",
            reportType: "COMBINED",
            granularity: fromDate && toDate ? "DAILY"
                : "MONTHLY",
            periodLabel:
                periodLabel,
        },

        sections: [

            {
                title: "Financial Summary",
                headers: ["Category", "Amount"],
                rows: [
                    { columns: ["Total Income", `₹${data.incomeTotal}`] },
                    { columns: ["Total Expenses", `₹${data.expenseTotal}`] },
                    { columns: ["Net Balance", `₹${data.netBalance}`] },
                ],
            },

            {
                title: "Income Details",
                headers: ["Date", "Student", "Mode", "Collected By", "Amount"],
                rows: data.incomes.map((p) => ({
                    columns: [
                        new Date(p.created_at).toLocaleDateString(),
                        p.studentName,
                        p.mode,
                        p.collected_by,
                        `₹${p.amount}`,
                    ],
                })),
            },

            {
                title: "Expense Details",
                headers: ["Date", "Category", "Description", "Paid To", "Mode", "Amount"],
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
                title: "Category-wise Summary",
                headers: ["Category", "Total"],
                rows: categorySummary.map((c) => ({
                    columns: [c.category, `₹${c.total}`],
                })),
            },

        ]

    } as const;

    return (

        <div className="report-card">

            <h3>
                Income vs Expense — {periodLabel} ({academicYear})
            </h3>

            {/* =========================
               Summary
            ========================= */}

            <div className="section">

                <h4>Summary</h4>

                <table className="reports-table">

                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Amount</th>
                        </tr>
                    </thead>

                    <tbody>

                        <tr>
                            <td>Total Income</td>
                            <td className="amount positive">
                                ₹{data.incomeTotal}
                            </td>
                        </tr>

                        <tr>
                            <td>Total Expenses</td>
                            <td className="amount negative">
                                ₹{data.expenseTotal}
                            </td>
                        </tr>

                        <tr>
                            <td><strong>Net Balance</strong></td>
                            <td
                                className={
                                    data.netBalance >= 0
                                        ? "amount positive"
                                        : "amount negative"
                                }
                            >
                                ₹{data.netBalance}
                            </td>
                        </tr>

                    </tbody>

                </table>

            </div>

            {/* =========================
               Income Table
            ========================= */}

            <div className="section">

                <h4>Income Details</h4>

                <table className="reports-table">

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

                        {data.incomes.map((p) => (

                            <tr key={p.id}>

                                <td>
                                    {new Date(p.created_at).toLocaleDateString()}
                                </td>

                                <td>{p.studentName}</td>

                                <td>{p.mode}</td>

                                <td>{p.collected_by}</td>

                                <td className="amount">
                                    ₹{p.amount}
                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

            {/* =========================
               Expense Table
            ========================= */}

            <div className="section">

                <h4>Expense Details</h4>

                <table className="reports-table">

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

                                <td>{e.category}</td>

                                <td>{e.description}</td>

                                <td>{e.paid_to}</td>

                                <td>{e.mode}</td>

                                <td className="amount">
                                    ₹{e.amount}
                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

            {/* =========================
               Print
            ========================= */}

            <button
                className="print-btn"
                onClick={() => printReport(printData)}
            >
                Print / Save as PDF
            </button>

        </div>

    );
}

export default CombinedReport;
