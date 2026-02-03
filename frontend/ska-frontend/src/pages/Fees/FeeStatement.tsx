import { useParams } from "react-router-dom";
import { useStudents } from "../../context/StudentContext";
import { useClasses } from "../../context/ClassContext";
import { useSections } from "../../context/SectionContext";
import { useFeeLedger } from "../../context/FeeLedgerContext";
import { useAcademicYear } from "../../context/AcademicYearContext";
import { printReport } from "../Reports/Utils/PrintUtils";
import "../../styles/FeeStatement.css";

function FeeStatement() {
    const { id } = useParams<{ id: string }>();

    const { students } = useStudents();
    const { classes } = useClasses();
    const { sections } = useSections();
    const {
        getLedgerByStudentYear,
        getLedgerSummary,
        payments,
        adjustments,
        getReceiptNumber,
    } = useFeeLedger();
    const { academicYear } = useAcademicYear();

    const student = students.find((s) => s.id === id);
    if (!student) return <p>Student not found.</p>;

    const ledger = getLedgerByStudentYear(student.id, academicYear);
    if (!ledger) return <p>No ledger for selected academic year.</p>;

    const summary = getLedgerSummary(ledger.id);

    const studentPayments = payments.filter(
        (p) => p.ledgerId === ledger.id
    );

    const studentAdjustments = adjustments.filter(
        (a) => a.ledgerId === ledger.id
    );

    const cls = classes.find((c) => c.id === ledger.classId);
    const sec = sections.find((s) => s.id === student.sectionID);

    /* =========================
       PRINT DATA (UNIFIED SYSTEM)
    ========================= */

    const printData = {
        title: "Fee Statement",
        meta: {
            academicYear,
            studentName: `${student.firstName} ${student.lastName}`,
            reportType: "FEE_STATEMENT",
        },
        sections: [
            {
                title: "Student Details",
                headers: ["Field", "Value"],
                rows: [
                    {
                        columns: ["Name", `${student.firstName} ${student.lastName}`],
                    },
                    {
                        columns: ["Class", cls?.ClassName ?? "-"],
                    },
                    {
                        columns: ["Section", sec?.name ?? "-"],
                    },
                ],
            },

            {
                title: "Fee Breakdown",
                headers: ["Fee Component", "Amount"],
                rows: ledger.baseComponents.map((c) => ({
                    columns: [c.name, `₹${c.amount}`],
                })),
            },

            ...(studentAdjustments.length > 0
                ? [
                    {
                        title: "Adjustments",
                        headers: ["Type", "Amount"],
                        rows: studentAdjustments.map((a) => ({
                            columns: [
                                a.type,
                                `${a.amount < 0 ? "-" : "+"}₹${Math.abs(a.amount)}`,
                            ],
                        })),
                    },
                ]
                : []),

            ...(studentPayments.length > 0
                ? [
                    {
                        title: "Payments",
                        headers: ["Receipt No", "Date", "Mode", "Amount"],
                        rows: studentPayments.map((p) => ({
                            columns: [
                                getReceiptNumber(p.id),
                                new Date(p.createdAt).toLocaleDateString(),
                                p.mode,
                                `₹${p.amount}`,
                            ],
                        })),
                    },
                ]
                : []),

            {
                title: "Summary",
                headers: ["Metric", "Value"],
                rows: [
                    { columns: ["Total Fee", `₹${summary.finalFee}`] },
                    { columns: ["Paid", `₹${summary.paidTotal}`] },
                    { columns: ["Pending", `₹${summary.pending}`] },
                    { columns: ["Status", summary.status] },
                ],
            },
        ],
    };

    /* =========================
       RENDER (SCREEN VIEW)
    ========================= */

    return (
        <div className="statement-page">
            {/* Header */}
            <div className="statement-header">
                <h1>Smart Kids Academy</h1>
                <p>Fee Statement</p>
                <p>Academic Year: {academicYear}</p>
            </div>

            {/* Student Info */}
            <div className="statement-section">
                <h3>Student Details</h3>
                <p>
                    <strong>Name:</strong> {student.firstName} {student.lastName}
                </p>
                <p>
                    <strong>Class:</strong> Class {cls?.ClassName}
                </p>
                <p>
                    <strong>Section:</strong> {sec?.name ?? "—"}
                </p>
            </div>

            {/* Fee Breakdown */}
            <div className="statement-section">
                <h3>Fee Breakdown</h3>
                <table>
                    <tbody>
                        {ledger.baseComponents.map((c) => (
                            <tr key={c.name}>
                                <td>{c.name}</td>
                                <td>₹{c.amount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Adjustments */}
            {studentAdjustments.length > 0 && (
                <div className="statement-section">
                    <h3>Adjustments</h3>
                    <table>
                        <tbody>
                            {studentAdjustments.map((a) => (
                                <tr key={a.id}>
                                    <td>{a.type}</td>
                                    <td>
                                        {a.amount < 0 ? "-" : "+"}₹{Math.abs(a.amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Payments */}
            {studentPayments.length > 0 && (
                <div className="statement-section">
                    <h3>Payments</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Receipt No</th>
                                <th>Date</th>
                                <th>Mode</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentPayments.map((p) => (
                                <tr key={p.id}>
                                    <td>{getReceiptNumber(p.id)}</td>
                                    <td>
                                        {new Date(p.createdAt).toLocaleDateString()}
                                    </td>
                                    <td>{p.mode}</td>
                                    <td>₹{p.amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Summary */}
            <div className="statement-summary">
                <p>
                    <strong>Total Fee:</strong> ₹{summary.finalFee}
                </p>
                <p>
                    <strong>Paid:</strong> ₹{summary.paidTotal}
                </p>
                <p>
                    <strong>Pending:</strong> ₹{summary.pending}
                </p>
                <p>
                    <strong>Status:</strong> {summary.status}
                </p>
            </div>

            {/* Print */}
            <div className="print-actions">
                <button onClick={() => printReport(printData)}>
                    Print / Save as PDF
                </button>
            </div>
        </div>
    );
}

export default FeeStatement;
