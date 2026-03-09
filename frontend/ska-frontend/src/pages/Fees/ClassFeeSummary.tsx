import { useFeeLedger } from "../../context/FeeLedgerContext";
import { useClasses } from "../../context/ClassContext";
import { useAcademicYear } from "../../context/AcademicYearContext";
import "../../styles/classFeeSummary.css";
import { useState, useEffect } from "react";
import type { LedgerSummary } from "../../context/FeeLedgerContext";

function ClassFeeSummary() {
  const { ledgers, getLedgerSummary } = useFeeLedger();
  const { classes } = useClasses();
  const { academicYears, activeYear } = useAcademicYear();
  const [ledgerSummaries, setLedgerSummaries] = useState<Record<string, LedgerSummary>>({});

  /* =========================
     Build summary per class
  ========================= */

  useEffect(() => {
    const loadSummaries = async () => {
      const map: Record<string, LedgerSummary> = {};

      for (const ledger of ledgers) {
        const s = await getLedgerSummary(ledger.id);
        if (s) map[ledger.id] = s;
      }

      setLedgerSummaries(map);
    };

    loadSummaries();
  }, [ledgers]);

  const summary = classes.map((cls) => {
    const classLedgers = ledgers.filter(
      (l) =>
        l.classId === cls.id &&
        l.academicSessionId === activeYear?.id
    );

    let totalFee = 0;
    let collected = 0;
    let pending = 0;

    classLedgers.forEach((ledger) => {
      const s = ledgerSummaries[ledger.id];
      if (!s) return;

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

  /* =========================
   Load Ledger Summaries
========================= */



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
        <select value={activeYear?.id} disabled>
          {academicYears?.map((y) => (
            <option key={y.id} value={y.id}>
              {y.name}
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
