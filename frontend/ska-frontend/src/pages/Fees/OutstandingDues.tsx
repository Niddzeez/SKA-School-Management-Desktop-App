import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFeeLedger } from "../../context/FeeLedgerContext";
import { useStudents } from "../../context/StudentContext";
import { useClasses } from "../../context/ClassContext";
import { useAcademicYear } from "../../context/AcademicYearContext";
import "../../styles/OutstandingDues.css"

function OutstandingDues() {
    const navigate = useNavigate();

    const { ledgers, getLedgerSummary } = useFeeLedger();
    const { students } = useStudents();
    const { classes } = useClasses();
    const { academicYear, availableYears } = useAcademicYear();

    const [selectedClassId, setSelectedClassId] = useState("");

    /* =========================
       Build outstanding rows
    ========================= */

    const rows = ledgers
        .filter((l) => l.academicYear === academicYear)
        .map((ledger) => {
            const summary = getLedgerSummary(ledger.id);
            if (summary.pending <= 0) return null;

            const student = students.find(
                (s) => s.id === ledger.studentId
            );
            if (!student) return null;

            if (
                selectedClassId &&
                ledger.classId !== selectedClassId
            )
                return null;

            const cls = classes.find(
                (c) => c.id === ledger.classId
            );

            return {
                ledgerId: ledger.id,
                studentId: student.id,
                studentName: `${student.firstName} ${student.lastName}`,
                className: cls ? cls.ClassName : "—",
                pending: summary.pending,
                status: summary.status,
            };
        })
        .filter(Boolean)
        .sort((a, b) => b!.pending - a!.pending);

    const totalOutstanding = rows.reduce(
        (sum, r) => sum + r!.pending,
        0
    );

    return (
        <div className="page-container">
            <h1>Outstanding Dues</h1>

            <p>
                View unpaid fees by academic year and class.
                <br />
                <strong>Read-only report.</strong>
            </p>

            {/* Filters */}
            <div className="form-row">
                <select value={academicYear} disabled>
                    {availableYears.map((y) => (
                        <option key={y} value={y}>
                            {y}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                >
                    <option value="">All Classes</option>
                    {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                            Class {cls.ClassName}
                        </option>
                    ))}
                </select>
            </div>

            {/* Summary */}
            <div >
                Total Outstanding: ₹{totalOutstanding}
            </div>

            {/* Table */}
            {rows.length === 0 && (
                <p >
                    No outstanding dues for this selection.
                </p>
            )}

            {rows.length > 0 && (
                <table
                    className="payments-table"

                >
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Class</th>
                            <th>Pending Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r) => (
                            <tr
                                key={r!.ledgerId}

                                onClick={() =>
                                    navigate(`/students/${r!.studentId}`)
                                }
                            >
                                <td>{r!.studentName}</td>
                                <td>Class {r!.className}</td>
                                <td>₹{r!.pending}</td>
                                <td>
                                    <span
                                        className={`fee-status ${r!.status.toLowerCase()}`}
                                    >
                                        {r!.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default OutstandingDues;
