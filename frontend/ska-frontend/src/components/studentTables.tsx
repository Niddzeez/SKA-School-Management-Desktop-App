import type { Student } from "../types/Student";
import { useNavigate } from "react-router-dom";
import { useClasses } from "../context/ClassContext";
import { useSections } from "../context/SectionContext";
import "../styles/Students.css";

type StudentTableProps = {
  students: Student[];
};

function StudentTable({ students }: StudentTableProps) {
  const navigate     = useNavigate();
  const { classes }  = useClasses();
  const { sections } = useSections();

  if (students.length === 0) {
    return (
      <div className="student-table-card">
        <div style={{ padding: "40px", textAlign: "center", color: "#8e9ab5", fontStyle: "italic" }}>
          No students to display.
        </div>
      </div>
    );
  }

  return (
    <div className="student-table-card">
      <div className="student-table-head">
        <div className="student-table-label">
          {students.length} student{students.length !== 1 ? "s" : ""}
        </div>
      </div>

      <table className="student-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Class & Section</th>
            <th>Gender</th>
            <th>Phone</th>
            <th>City</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {students.map((student) => {
            const initials = `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase();

            const cls = classes.find((c) => c.id === student.classID);
            const sec = sections.find((s) => s.id === student.sectionID);

            const className   = cls?.ClassName ?? student.academic?.grade ?? "—";
            const sectionName = sec?.name ?? student.academic?.section ?? null;
            const classLabel  = sectionName ? `${className} · ${sectionName}` : className;

            const genderClass =
              student.gender === "Male"   ? "sb sb-male"   :
              student.gender === "Female" ? "sb sb-female" :
              "sb sb-other";

            return (
              <tr
                key={student.id}
                onClick={() => navigate(`/students/${student.id}`)}
              >
                <td>
                  <div className="student-cell">
                    <div className="student-initials">{initials}</div>
                    <div>
                      <div className="student-name">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="student-id">{student.id.slice(0, 8)}</div>
                    </div>
                  </div>
                </td>

                <td>
                  {className !== "—"
                    ? <span className="sb sb-class">{classLabel}</span>
                    : <span style={{ color: "#8e9ab5" }}>—</span>}
                </td>

                <td>
                  <span className={genderClass}>{student.gender || "—"}</span>
                </td>

                <td>{student.phoneNumber || "—"}</td>
                <td>{student.address?.city || "—"}</td>

                <td>
                  <button
                    className="student-view-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/students/${student.id}`);
                    }}
                  >
                    View →
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default StudentTable;