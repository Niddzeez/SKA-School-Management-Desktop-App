import { useMemo } from "react";
import { useFeeLedger } from "../../../context/FeeLedgerContext";
import { getAcademicYearRange } from "../Utils/reportDateUtils";
import "../../../components/print/report-print.css";
import { printReport } from "../Utils/PrintUtils";
import { useStudents } from "../../../context/StudentContext";

type Props = {
    academicYear: string;
    selectedMonth: number | null; // 0 = Jan
};

function MonthlyIncomeReport({
    academicYear,
    selectedMonth,
}: Props) {
    const { payments } = useFeeLedger();
    const { students } = useStudents();

    if (selectedMonth === null) {
        return <p>Please select a month.</p>;
    }

    const { start } = getAcademicYearRange(academicYear);

    /* =========================
       Month Range Calculation
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
       Filter Monthly Income
    ========================= */

    const monthlyIncome = useMemo(() => {
        return payments.filter((p) => {
            const d = new Date(p.createdAt);
            return d >= monthStart && d <= monthEnd;
        });
    }, [payments, monthStart, monthEnd]);

    if (monthlyIncome.length === 0) {
        return <p>No income for this month.</p>;
    }

    /* =========================
       Totals
    ========================= */

    const totalIncome = monthlyIncome.reduce(
        (sum, p) => sum + p.amount,
        0
    );

    /* =========================
       Print Data
    ========================= */

    const printData = {
        title: "Monthly Income Report",
        meta: {
            academicYear,
            reportType: "INCOME",
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
                title: "Summary",
                headers: ["Metric", "Value"],
                rows: [
                    {
                        columns: ["Total Income", `₹${totalIncome}`],
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
                Monthly Income — {monthLabel} {academicYear}
            </h3>

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

            <p className="total-line">
                <strong>Total Income:</strong> ₹{totalIncome}
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

export default MonthlyIncomeReport;