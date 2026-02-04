import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSections } from "../../context/SectionContext";
import { useClasses } from "../../context/ClassContext";
import { useStudents } from "../../context/StudentContext";

import "./dashboard.css";

function TeacherDashboard() {
  const { role, teacherId } = useAuth();
  const { sections } = useSections();
  const { classes } = useClasses();
  const { students } = useStudents();

  // 🔒 Hard role guard
  if (role !== "TEACHER") {
    return <Navigate to="/dashboard" replace />;
  }

  /* =========================
     Derive Teacher's Class
  ========================= */

  const mySection = teacherId
    ? sections.find((sec) => sec.classTeacherID === teacherId)
    : null;

  const myClass = mySection
    ? classes.find((c) => c.id === mySection.classID)
    : null;

  const myStudents = mySection
    ? students.filter(
        (s) =>
          s.status === "Active" &&
          s.classID === mySection.classID &&
          s.sectionID === mySection.id
      )
    : [];

  /* =========================
     Render
  ========================= */

  return (
    <div className="dashboard-page">
      {/* =========================
          Header
      ========================= */}
      <div className="dashboard-header">
        <h1>Teacher Dashboard</h1>
        <p className="dashboard-subtitle">
          Your class overview & quick actions
        </p>
      </div>

      {/* =========================
          My Class Widget
      ========================= */}
      <div className="dashboard-widget">
        <h3>My Class</h3>

        {myClass && mySection ? (
          <>
            <p>
              <strong>Class:</strong> {myClass.ClassName}
            </p>
            <p>
              <strong>Section:</strong> {mySection.name}
            </p>
            <p>
              <strong>Active Students:</strong> {myStudents.length}
            </p>
          </>
        ) : (
          <p className="muted">
            You are not assigned as a class teacher yet.
          </p>
        )}
      </div>

      {/* =========================
          Students Preview Widget
      ========================= */}
      <div className="dashboard-widget">
        <h3>Students (Preview)</h3>

        {myStudents.length === 0 ? (
          <p className="muted">No students to show.</p>
        ) : (
          <ul className="student-preview-list">
            {myStudents.slice(0, 5).map((s) => (
              <li key={s.id}>
                {s.firstName} {s.lastName}
              </li>
            ))}
          </ul>
        )}

        <Link className="dashboard-link" to="/students">
          View Full Student List →
        </Link>
      </div>

      {/* =========================
          Quick Actions
      ========================= */}
      <div className="dashboard-widget">
        <h3>Quick Actions</h3>

        <ul className="dashboard-actions">
          <li>
            <Link to="/students">View Students</Link>
          </li>
          <li>
            <Link to="/class-register">Print Class Register</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default TeacherDashboard;
