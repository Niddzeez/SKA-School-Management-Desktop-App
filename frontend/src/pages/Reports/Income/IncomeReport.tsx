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

interface Payment {
    id: string;
    student_id: string;
    studentName: string;
    amount: number;
    mode: string;
    collected_by: string;
    reference: string | null;
    created_at: string;
}

interface IncomeReportData {
    totalCollected: number;
    paymentCount: number;
    payments: Payment[];
}

function IncomeReport({
    academicYear,
    fromDate,
    toDate,
    periodLabel,
}: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<IncomeReportData | null>(null);

    useEffect(() => {
        if (!academicYear) return;

        const fetchReport = async () => {
            try {
                setLoading(true);
                setError(null);

                const params = new URLSearchParams();
                params.append("year", academicYear);

                if (fromDate) params.append("fromDate", fromDate);
                if (toDate) params.append("toDate", toDate);

                const res = await apiClient.get<IncomeReportData>(
                    `/api/reports/income?${params.toString()}`
                );

                setData(res);
            } catch (err: any) {
                setError(err?.message ?? "Failed to load income report");
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [academicYear, fromDate, toDate]);

    if (loading) return <p>Loading income report...</p>;
    if (error) return <p className="error">{error}</p>;
    if (!data) return null;

    const printData = {
        title: `Income Report — ${periodLabel}`,
        meta: {
            granularity: fromDate && toDate                ? "DAILY"
                : "MONTHLY",
            academicYear,
            reportType: "INCOME",
            periodLabel,
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
                rows: data.payments.map((p) => ({
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
                title: "Summary",
                headers: ["Metric", "Value"],
                rows: [
                    {
                        columns: [
                            "Total Payments",
                            data.paymentCount.toString(),
                        ],
                    },
                    {
                        columns: [
                            "Total Income",
                            `₹${data.totalCollected}`,
                        ],
                    },
                ],
            },
        ],
    } as const;

    return (
        <div className="report-card">
            <h3>
                Income Report — {periodLabel} ({academicYear})
            </h3>

            <div className="section">
                <h4>Income</h4>

                {data.payments.length === 0 ? (
                    <p>No income recorded.</p>
                ) : (
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
                            {data.payments.map((p) => (
                                <tr key={p.id}>
                                    <td>
                                        {new Date(p.created_at).toLocaleDateString()}
                                    </td>
                                    <td>{p.studentName}</td>
                                    <td>{p.mode}</td>
                                    <td>{p.collected_by}</td>
                                    <td className="amount">₹{p.amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <p className="total-line">
                    <strong>Total Income:</strong> ₹{data.totalCollected}
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

export default IncomeReport;