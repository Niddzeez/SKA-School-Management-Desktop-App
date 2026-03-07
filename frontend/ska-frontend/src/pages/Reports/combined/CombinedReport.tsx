import { useEffect, useState } from "react";
import { apiClient } from "../../../services/apiClient";
import "../../../components/print/report-print.css";
import { printReport } from "../Utils/PrintUtils";

type Props = {
    academicYear: string;
    fromDate?: string;
    toDate?: string;
    periodLabel: string;
};

interface CombinedReportData {
    incomeTotal: number;
    expenseTotal: number;
    netBalance: number;
}

function CombinedReport({ academicYear, fromDate, toDate, periodLabel }: Props) {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<CombinedReportData | null>(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                setLoading(true);
                setError(null);

                const params = new URLSearchParams({ year: academicYear });
                if (fromDate) params.append("fromDate", fromDate);
                if (toDate) params.append("toDate", toDate);

                const res = await apiClient.get<CombinedReportData>(
                    `/api/reports/combined?${params.toString()}`
                );
                setData(res);
            } catch (err: any) {
                setError(err.message || "Failed to load combined report");
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [academicYear, fromDate, toDate]);

    if (loading) return <p>Loading combined report...</p>;
    if (error) return <p className="error">{error}</p>;
    if (!data) return null;

    const printData = {
        title: `Income vs Expense Report — ${periodLabel}`,
        meta: {
            academicYear,
            reportType: "COMBINED",
            periodLabel,
        },
        sections: [
            {
                title: "Financial Summary",
                headers: ["Category", "Amount"],
                rows: [
                    { columns: ["Total Income", `₹${data.incomeTotal}`] },
                    { columns: ["Total Expenses", `₹${data.expenseTotal}`] },
                ],
            },
            {
                title: "Net Balance",
                headers: ["Metric", "Value"],
                rows: [{ columns: ["Net Balance", `₹${data.netBalance}`] }],
            },
        ],
    } as const;

    return (
        <div className="report-card">
            <h3>Income vs Expense — {periodLabel} ({academicYear})</h3>

            <div className="section">
                <h4>Summary</h4>
                <table className="report-table">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Total Income</td>
                            <td className="amount positive">₹{data.incomeTotal}</td>
                        </tr>
                        <tr>
                            <td>Total Expenses</td>
                            <td className="amount negative">₹{data.expenseTotal}</td>
                        </tr>
                    </tbody>
                </table>

                <p className="total-line">
                    <strong>Net Balance:</strong>{" "}
                    <span className={data.netBalance >= 0 ? "positive" : "negative"}>
                        ₹{data.netBalance}
                    </span>
                </p>
            </div>

            <button className="print-btn" onClick={() => printReport(printData)}>
                Print / Save as PDF
            </button>
        </div>
    );
}

export default CombinedReport;
