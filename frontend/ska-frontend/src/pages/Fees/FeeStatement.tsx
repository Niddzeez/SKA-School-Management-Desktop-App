import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useStudents } from "../../context/StudentContext";
import { useClasses } from "../../context/ClassContext";
import { useSections } from "../../context/SectionContext";
import { useFeeLedger } from "../../context/FeeLedgerContext";
import { useAcademicYear } from "../../context/AcademicYearContext";
import "../../styles/FeeStatement.css";

function FeeStatement() {
    const { id } = useParams<{ id: string }>();

    const { students } = useStudents();
    const { classes } = useClasses();
    const { sections } = useSections();
    const { getLedgerByStudentYear, getLedgerSummary, payments, adjustments, getReceiptNumber } =
        useFeeLedger();
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
       PDF Filename Handling
    ========================= */

    useEffect(() => {
        const originalTitle = document.title;
        document.title = `${student.firstName} ${student.lastName} - ${academicYear} - Fee Statement`;

        return () => {
            document.title = originalTitle;
        };
    }, [student, academicYear]);

    /* =========================
       PRINT HANDLER (ISOLATED)
    ========================= */

    const handlePrint = () => {
        const printWindow = window.open(
            "",
            "_blank",
            "width=900,height=650"
        );

        if (!printWindow) return;

        const title = `${student.firstName} ${student.lastName} - ${academicYear} - Fee Statement`;

        printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #000;
            }

            h1 {
              text-align: center;
              margin-bottom: 4px;
            }

            h3 {
              margin-top: 16px;
              border-bottom: 1px solid #000;
              padding-bottom: 4px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 8px;
            }

            th, td {
              padding: 6px;
              border-bottom: 1px solid #ccc;
            }

            th:last-child,
            td:last-child {
              text-align: right;
            }

            .section {
              margin-top: 12px;
            }

            .summary {
              margin-top: 16px;
              font-size: 1.05rem;
            }
          </style>
        </head>
        <body>
          ${document.querySelector(".statement-page")?.innerHTML}
        </body>
      </html>
    `);

        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    /* =========================
       RENDER
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
                <p><strong>Name:</strong> {student.firstName} {student.lastName}</p>
                <p><strong>Class:</strong> Class {cls?.ClassName}</p>
                <p><strong>Section:</strong> {sec?.name ?? "—"}</p>
                <p>
                    <strong>Student ID:</strong>{" "}
                    <span>{student.id}</span>
                </p>
            </div>

            {/* Fee Breakdown */}
            <div className="statement-section">
                <h3>Fee Breakdown</h3>
                <table>
                    <tbody>
                        {ledger.baseComponents.map((c, idx) => (
                            <tr key={idx}>
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
                                <th>Amount</th>
                                <th>Mode</th>

                            </tr>
                        </thead>
                        <tbody>
                            {studentPayments.map((p) => (
                                <tr key={p.id}>
                                    <tr key={p.id}>
                                        <td>{getReceiptNumber(p.id)}</td>
                                        <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                                        <td>₹{p.amount}</td>
                                        <td>{p.mode}</td>
                                    </tr>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Summary */}
            <div className="statement-summary">
                <p><strong>Total Fee:</strong> ₹{summary.finalFee}</p>
                <p><strong>Paid:</strong> ₹{summary.paidTotal}</p>
                <p><strong>Pending:</strong> ₹{summary.pending}</p>
                <p><strong>Status:</strong> {summary.status}</p>
            </div>

            {/* Print */}
            <div className="print-actions">
                <button onClick={handlePrint}>
                    Print / Save as PDF
                </button>
            </div>
        </div>
    );
}

export default FeeStatement;
