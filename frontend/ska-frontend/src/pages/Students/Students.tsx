import { useState, useEffect } from "react";
import StudentTable from "../../components/studentTables";
import { useStudents } from "../../context/StudentContext";
import "../../styles/Students.css";

// Students Page Component

function Students() {
  const { students } = useStudents();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ACTIVE" | "WITHDRAWN" | "ALUMNI" | "ALL"
  >("ACTIVE");


  // Filter active students

  const visibleStudents = students.filter((student) => {
    switch (statusFilter) {
      case "ACTIVE":
        return student.status === "Active";

      case "WITHDRAWN":
        return student.status === "Withdrawn";

      case "ALUMNI":
        return student.status === "Alumni";

      case "ALL":
        return true;

      default:
        return false;
    }
  });
  const activeStudents = visibleStudents;

  // Filter students based on search query

  const filteredStudents = activeStudents.filter((student) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;

    const searchableFields = [
      student.id,
      student.firstName,
      student.lastName,
      student.phoneNumber,
      student.address.city,
      student.classID,
      student.sectionID,
      student.father.name,
      student.mother.name,
    ];
    // Check if any searchable field includes the query
    return searchableFields.some((field) =>
      String(field ?? "")
        .toLowerCase()
        .includes(query)
    );
  });

  useEffect(() => {
    setSearch("");
  }, [statusFilter]);


  // Render the Students Page

  return (
    <div className="students-page">
      <div className="students-header">
        <h1>Students</h1>

        <div className="status-filter">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as any)
            }
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

      <StudentTable students={filteredStudents} />

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
