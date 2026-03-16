import { useState, useEffect } from "react";
import StudentTable from "../../components/studentTables";
import { useStudents } from "../../context/StudentContext";
import { useFeeLedger } from "../../context/FeeLedgerContext";
import { useAcademicYear } from "../../context/AcademicYearContext";
import "../../styles/Students.css";

function Students() {
  const { students }       = useStudents();
  const { ledgers, getLedgerSummary } = useFeeLedger();
  const { academicYear }   = useAcademicYear();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ACTIVE" | "WITHDRAWN" | "ALUMNI" | "ALL"
  >("ACTIVE");

  /* ── Visible students by status ── */
  const visibleStudents = students.filter((s) => {
    switch (statusFilter) {
      case "ACTIVE":    return s.status === "Active";
      case "WITHDRAWN": return s.status === "Withdrawn";
      case "ALUMNI":    return s.status === "Alumni";
      case "ALL":       return true;
      default:          return false;
    }
  });

  /* ── Search filter ── */
  const filteredStudents = visibleStudents.filter((student) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;
    const fields = [
      student.id, student.firstName, student.lastName,
      student.phoneNumber, student.address?.city,
      student.classID, student.sectionID,
      student.father?.name, student.mother?.name,
    ];
    return fields.some((f) =>
      String(f ?? "").toLowerCase().includes(query)
    );
  });

  useEffect(() => { setSearch(""); }, [statusFilter]);

  /* ── KPI calculations ── */
  const activeStudents = students.filter((s) => s.status === "Active");
  const maleCount      = activeStudents.filter((s) => s.gender === "Male").length;
  const femaleCount    = activeStudents.filter((s) => s.gender === "Female").length;

  const feePendingCount = activeStudents.filter((s) => {
    const ledger = ledgers.find(
      (l) => l.studentId === s.id && l.academicYear === academicYear
    );
    if (!ledger) return false;
    const summary = getLedgerSummary(ledger.id);
    return summary.pending > 0;
  }).length;

  return (
    <div className="students-page">

      {/* ── Header ── */}
      <div className="students-header">
        <h1>Students</h1>
        <div className="students-header-right">
          <div className="status-filter">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="ACTIVE">Active Students</option>
              <option value="WITHDRAWN">Withdrawn / Inactive</option>
              <option value="ALUMNI">Alumni</option>
              <option value="ALL">All Students</option>
            </select>
          </div>

          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search by name or ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            {search && (
              <button
                className="clear-search"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="students-kpi-strip">
        <div className="skpi total">
          <div className="skpi-label">Total Active</div>
          <div className="skpi-value">{activeStudents.length}</div>
        </div>
        <div className="skpi male">
          <div className="skpi-label">Male</div>
          <div className="skpi-value">{maleCount}</div>
        </div>
        <div className="skpi female">
          <div className="skpi-label">Female</div>
          <div className="skpi-value">{femaleCount}</div>
        </div>
        <div className="skpi fee-pending">
          <div className="skpi-label">Fee Pending</div>
          <div className="skpi-value">{feePendingCount}</div>
        </div>
      </div>

      {/* ── Table ── */}
      <StudentTable students={filteredStudents} />

      {/* ── No results ── */}
      {filteredStudents.length === 0 && search && (
        <div className="no-results">
          <p>No students found</p>
          <span>Try a different name, ID, or clear the search</span>
        </div>
      )}

    </div>
  );
}

export default Students;