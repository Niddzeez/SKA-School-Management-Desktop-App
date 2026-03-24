import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useStudents } from "../../context/StudentContext";
import { useClasses } from "../../context/ClassContext";
import { useAcademicYear } from "../../context/AcademicYearContext";

import { apiClient } from "../../services/apiClient";
import { printReport } from "../Reports/Utils/PrintUtils";

import "../../styles/PendingFees.css";

interface PendingRow {
  ledger_id: string;
  student_id: string;
  class_id: string;
  total_fee: number | string;
  paid_total: number | string;
  pending: number | string;
}

function PendingFees() {
  const navigate = useNavigate();

  const { students } = useStudents();
  const { classes } = useClasses();
  const { activeYear } = useAcademicYear();

  const [rows, setRows] = useState<PendingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =========================================================
  // LOAD PENDING FEES
  // =========================================================

  useEffect(() => {
    async function loadPendingFees() {
      if (!activeYear?.id) return;

      try {
        setLoading(true);
        setError(null);

        const res = await apiClient.get<PendingRow[]>(
          `/api/reports/pending-fees?year=${activeYear.id}`
        );

        setRows(res);
      } catch (err: any) {
        setError(err.message || "Failed to load pending fees");
      } finally {
        setLoading(false);
      }
    }

    loadPendingFees();
  }, [activeYear?.id]);

  // =========================================================
  // EXPORT PDF (CLASS WISE)
  // =========================================================

  const handleExportPDF = () => {

    const classWiseMap = new Map<string, PendingRow[]>();

    rows.forEach((row) => {

      const classId = row.class_id ?? "UNKNOWN";

      if (!classWiseMap.has(classId)) {
        classWiseMap.set(classId, []);
      }

      classWiseMap.get(classId)!.push(row);

    });

    const sections: any[] = [];

    classWiseMap.forEach((classRows, classId) => {

      const sortedRows = [...classRows].sort(
        (a, b) => Number(b.pending) - Number(a.pending)
      );

      const className =
        classes.find((c) => c.id === classId)?.ClassName ?? "Unknown Class";

      const classTotalPending = sortedRows.reduce(
        (sum, r) => sum + Number(r.pending),
        0
      );

      sections.push({
        title: `Class ${className}`,
        headers: [
          "Student Name",
          "Phone Number",
          "Total Fee",
          "Paid",
          "Pending",
        ],
        rows: sortedRows.map((r) => {

          const student = students.find(
            (s) => s.id === r.student_id
          );

          return {
            columns: [
              student
                ? `${student.firstName} ${student.lastName}`
                : "Unknown",
              student?.phoneNumber ??
              student?.father?.phone ??
              "—",
              `₹${Number(r.total_fee)}`,
              `₹${Number(r.paid_total)}`,
              `₹${Number(r.pending)}`
            ]
          };

        }),
        footer: `Class Total Pending: ₹${classTotalPending}`,
      });

    });

    const printData = {
      title: "Pending Fees Report",
      meta: {
        academicYear: activeYear?.name || "Unknown Year",
        reportType: "STATEMENT",
        granularity: "CLASS_WISE",
        periodLabel: "Pending Fees",
      },
      sections,
    } as const;

    printReport(printData);
  };

  // =========================================================
  // RENDER
  // =========================================================

  if (loading) return <p>Loading pending fees...</p>;

  if (error) return <p className="error">{error}</p>;

  return (
    <div className="pending-fees-page">

      <div className="pending-fees-header">
        <h2>Students with Pending Fees</h2>

        <button onClick={handleExportPDF}>
          Export Pending Fees (PDF)
        </button>
      </div>

      {rows.length === 0 ? (

        <p>No pending fees 🎉</p>

      ) : (

        <table className="pending-fees-table">

          <thead>
            <tr>
              <th>Student</th>
              <th>Total Fee</th>
              <th>Paid</th>
              <th>Pending</th>
            </tr>
          </thead>

          <tbody>

            {rows.map((row) => {

              const student = students.find(
                (s) => s.id === row.student_id
              );

              return (
                <tr
                  key={row.ledger_id}
                  className="clickable-row"
                  onClick={() =>
                    student && navigate(`/students/${student.id}`)
                  }
                >

                  <td>
                    {student
                      ? `${student.firstName} ${student.lastName}`
                      : "Unknown"}
                  </td>

                  <td>₹{Number(row.total_fee)}</td>
                  <td>₹{Number(row.paid_total)}</td>

                  <td className="pending">
                    ₹{Number(row.pending)}
                  </td>

                </tr>
              );

            })}

          </tbody>

        </table>

      )}

    </div>
  );
}

export default PendingFees;