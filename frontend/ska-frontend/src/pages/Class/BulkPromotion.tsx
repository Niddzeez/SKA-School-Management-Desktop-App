import { useState } from "react";
import { useStudents } from "../../context/StudentContext";
import { useClasses } from "../../context/ClassContext";
import { useFeeLedger } from "../../context/FeeLedgerContext";
import { useFeeStructures } from "../../context/FeeStructureContext";
import { useAcademicYear } from "../../context/AcademicYearContext";

const getNextAcademicYear = (year: string) => {
    const [start, end] = year.split("-").map(Number);
    return `${start + 1}-${end + 1}`;
};

function BulkPromotion() {
    const { students, assignStudenttoSection } = useStudents();
    const { classes } = useClasses();
    const { getLedgerByStudentYear, getLedgerSummary, upsertLedgerFromFeeStructure } =
        useFeeLedger();
    const { getActiveFeeStructure } = useFeeStructures();
    const { academicYear } = useAcademicYear();

    const [fromClassId, setFromClassId] = useState("");
    const [fromAcademicYear, setFromAcademicYear] = useState(academicYear);


    const getNextClassId = (currentClassId: string) => {
        const sorted = [...classes].sort(
            (a, b) => Number(a.ClassName) - Number(b.ClassName)
        );

        const index = sorted.findIndex((c) => c.id === currentClassId);
        if (index === -1 || index === sorted.length - 1) return null;

        return sorted[index + 1].id;
    };

    const eligibleStudents = students.filter((student) => {
        if (student.status !== "Active") return false;

        const ledger = getLedgerByStudentYear(
            student.id,
            fromAcademicYear
        );

        if (!ledger) return false;

        return ledger.classId === fromClassId;
    });


    const handleBulkPromote = () => {
        if (!fromClassId) return;

        const nextClassId = getNextClassId(fromClassId);
        if (!nextClassId) {
            alert("Selected class is the final class.");
            return;
        }

        const nextAcademicYear = getNextAcademicYear(fromAcademicYear);

        eligibleStudents.forEach((student) => {
            // 1️⃣ Promote student
            assignStudenttoSection(student.id, nextClassId, "");

            // 2️⃣ Create new ledger if fee structure exists
            const fs = getActiveFeeStructure(
                nextClassId,
                nextAcademicYear
            );

            if (!fs) return;

            upsertLedgerFromFeeStructure(
                student.id,
                nextClassId,
                nextAcademicYear,
                fs.components.map((c) => ({
                    name: c.name,
                    amount: c.amount,
                }))
            );
        });

        alert(
            `Promoted ${eligibleStudents.length} students to next class (${nextAcademicYear})`
        );
    };

    return (
        <div className="page-container">
            <h1>Bulk Promotion</h1>

            <p>
                Promote all students from one class to the next academic year.
                <br />
                <strong>Pending dues will remain payable in the old year.</strong>
            </p>

            <select
                value={fromClassId}
                onChange={(e) => setFromClassId(e.target.value)}
            >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                        Class {cls.ClassName}
                    </option>
                ))}
            </select>

            <select
                value={fromAcademicYear}
                onChange={(e) => setFromAcademicYear(e.target.value)}
            >
                <option value="2026-27">2026-27</option>
                <option value="2027-28">2027-28</option>
            </select>


            {fromClassId && (
                <>
                    <h3>Students to be Promoted</h3>

                    {eligibleStudents.length === 0 && (
                        <p>No active students found.</p>
                    )}

                    {eligibleStudents.length > 0 && (
                        <table className="payments-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Pending ({academicYear})</th>
                                </tr>
                            </thead>
                            <tbody>
                                {eligibleStudents.map((s) => {
                                    const ledger = getLedgerByStudentYear(
                                        s.id,
                                        academicYear
                                    );
                                    const pending = ledger
                                        ? getLedgerSummary(ledger.id).pending
                                        : 0;

                                    return (
                                        <tr key={s.id}>
                                            <td>
                                                {s.firstName} {s.lastName}
                                            </td>
                                            <td>
                                                {pending > 0 ? `₹${pending}` : "—"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}

                    <button
                        className="primary-btn"
                        onClick={handleBulkPromote}
                        style={{ marginTop: "12px" }}
                    >
                        Promote All Students
                    </button>
                </>
            )}
        </div>
    );
}

export default BulkPromotion;
