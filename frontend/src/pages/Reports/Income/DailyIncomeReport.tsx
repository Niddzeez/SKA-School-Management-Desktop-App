import { useMemo } from "react";
import { useFeeLedger } from "../../../context/FeeLedgerContext";
import { useStudents } from "../../../context/StudentContext";
import { getAcademicYearRange } from "../Utils/reportDateUtils";
import { printReport } from "../Utils/printUtils";
import "../../../components/print/report-print.css";

type Props = {
    academicYear: string;
    selectedDate: string | null;
};

function DailyIncomeReport({ academicYear, selectedDate }: Props) {
    const { payments } = useFeeLedger();
    const { students } = useStudents();

    if (!selectedDate) {
        return <p>Please select a date.</p>;
    }

    const { start, end } = getAcademicYearRange(academicYear);
    const target = new Date(selectedDate);

    if (target < start || target > end) {
        return (
            <p>
                Selected date does not belong to academic year {academicYear}.
            </p>
        );
    }

    /* =========================
       Student lookup map
    ========================= */

    const studentMap = useMemo(() => {
        const map = new Map<string, string>();
        students.forEach((s) =>
            map.set(s.id, `${s.firstName} ${s.lastName}`)
        );
        return map;
    }, [students]);

    const getStudentName = (studentId: string) =>
        studentMap.get(studentId) ?? "Unknown";

    /* =========================
       Daily Income Filter
    ========================= */

    const dailyIncome = useMemo(() => {
        return payments.filter((p) => {
            const d = new Date(p.createdAt);
            return d.toDateString() === target.toDateString();
        });
    }, [payments, selectedDate]);

    if (dailyIncome.length === 0) {
        return <p>No income recorded on this date.</p>;
    }

    /* =========================
       Totals
    ========================= */

    const totalIncome = dailyIncome.reduce(
        (sum, p) => sum + p.amount,
        0
    );

    /* =========================
       Print Structure
    ========================= */

    const printData = {
        title: "Daily Income Report",
        meta: {
            academicYear,
            reportType: "INCOME",
            granularity: "DAILY",
            periodLabel: target.toLocaleDateString(),
        },
        sections: [
            {
                title: "Income Details",
                headers: ["Date", "Student", "Mode", "Amount"],
                rows: dailyIncome.map((p) => ({
                    columns: [
                        new Date(p.createdAt).toLocaleDateString(),
                        getStudentName(p.studentId),
                        p.mode,
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
                Daily Income Report — {target.toLocaleDateString()}
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
                    {dailyIncome.map((p) => (
                        <tr key={p.id}>
                            <td>{new Date(p.createdAt).toLocaleDateString()}</td>
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

export default DailyIncomeReport;