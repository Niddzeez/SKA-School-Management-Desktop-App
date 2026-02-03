// src/pages/Reports/income/DailyIncomeReport.tsx

import { useFeeLedger } from "../../../context/FeeLedgerContext";
import { getAcademicYearRange } from "../Utils/reportDateUtils";
import "../../../components/print/report-print.css";
import { printReport } from "../Utils/PrintUtils";
import { useStudents } from "../../../context/StudentContext";


type Props = {
    academicYear: string;
    selectedDate: string | null; // yyyy-mm-dd
};

function DailyIncomeReport({ academicYear, selectedDate }: Props) {
    const { payments } = useFeeLedger();

    if (!selectedDate) {
        return <p>Please select a date.</p>;
    }

    const { start, end } = getAcademicYearRange(academicYear);
    const target = new Date(selectedDate);
    const { students } = useStudents();

    const getStudentName = (studentId: string) => {
        const s = students.find((st) => st.id === studentId);
        return s ? `${s.firstName} ${s.lastName}` : "Unknown";
    };


    if (target < start || target > end) {
        return (
            <p>
                Selected date does not belong to academic year {academicYear}.
            </p>
        );
    }

    const dailyIncome = payments.filter((p) => {
        const d = new Date(p.createdAt);
        return d.toDateString() === target.toDateString();
    });

    if (dailyIncome.length === 0) {
        return <p>No income recorded on this date.</p>;
    }

    const totalIncome = dailyIncome.reduce(
        (sum, p) => sum + p.amount,
        0
    );

    const printData = {
        title: "Daily Income Report",
        meta: {
            academicYear,
            reportType: "INCOME",
            granularity: "DAILY",
            periodLabel: new Date(selectedDate).toLocaleDateString(),
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




    return (
        <div className="report-card">
            <h3>
                Daily Income Report —{" "}
                {target.toLocaleDateString()}
            </h3>

            <table className="report-table">
                <thead>
                    <tr>
                        <th>Mode</th>
                        <th>Collected By</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {dailyIncome.map((p) => (
                        <tr key={p.id}>
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
