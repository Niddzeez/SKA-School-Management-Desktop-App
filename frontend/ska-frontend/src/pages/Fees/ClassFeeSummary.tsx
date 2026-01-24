import { useFeeLedger } from "../../context/FeeLedgerContext";
import { useClasses } from "../../context/ClassContext";
import { useAcademicYear } from "../../context/AcademicYearContext";
import "../../styles/classFeeSummary.css";

function ClassFeeSummary() {
  const { ledgers, getLedgerSummary } = useFeeLedger();
  const { classes } = useClasses();
  const { academicYear, availableYears } = useAcademicYear();

  /* =========================
     Build summary per class
  ========================= */

  const summary = classes.map((cls) => {
    const classLedgers = ledgers.filter(
      (l) =>
        l.classId === cls.id &&
        l.academicYear === academicYear
    );

    let totalFee = 0;
    let collected = 0;
    let pending = 0;

    classLedgers.forEach((ledger) => {
      const s = getLedgerSummary(ledger.id);
      totalFee += s.finalFee;
      collected += s.paidTotal;
      pending += s.pending;
    });

    return {
      classId: cls.id,
      className: cls.ClassName,
      students: classLedgers.length,
      totalFee,
      collected,
      pending,
    };
  });

  const grandTotal = summary.reduce(
    (acc, c) => {
      acc.totalFee += c.totalFee;
      acc.collected += c.collected;
      acc.pending += c.pending;
      return acc;
    },
    { totalFee: 0, collected: 0, pending: 0 }
  );

  return (
    <div className="page-container">
      <h1>Class-wise Fee Summary</h1>

      <p>
        Financial overview per class for the selected academic year.
        <br />
        <strong>Ledger-based. Read-only.</strong>
      </p>

      {/* Academic Year */}
      <div className="form-row">
        <select value={academicYear} disabled>
          {availableYears.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <table className="summary-table">
        <thead>
          <tr>
            <th>Class</th>
            <th>Students</th>
            <th>Total Fee</th>
            <th>Collected</th>
            <th>Pending</th>
          </tr>
        </thead>
        <tbody>
          {summary.map((row) => (
            <tr key={row.classId}>
              <td>Class {row.className}</td>
              <td>{row.students}</td>
              <td>₹{row.totalFee}</td>
              <td>₹{row.collected}</td>
              <td className={row.pending > 0 ? "pending" : ""}>
                ₹{row.pending}
              </td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr>
            <th>Total</th>
            <th>—</th>
            <th>₹{grandTotal.totalFee}</th>
            <th>₹{grandTotal.collected}</th>
            <th className="pending">
              ₹{grandTotal.pending}
            </th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default ClassFeeSummary;
