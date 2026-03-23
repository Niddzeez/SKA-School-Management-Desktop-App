import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSections } from "../../context/SectionContext";
import { useClasses } from "../../context/ClassContext";
import { useStudents } from "../../context/StudentContext";
import "./dashboard.css";

function TeacherDashboard() {
  const { role } = useAuth();
  const { sections }        = useSections();
  const { orderedClasses }  = useClasses();   // ← fixed: was `classes`
  const { students }        = useStudents();

  /* ── Role guard ── */
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
    ? orderedClasses.find((c) => c.id === mySection.classID)
    : null;

  const myStudents = mySection
    ? students.filter(
        (s) =>
          s.status === "Active" &&
          s.classID  === mySection.classID &&
          s.sectionID === mySection.id
      )
    : [];

  /* =========================
     Render
  ========================= */

  return (
    <div className="dashboard-page">

      {/* ── Header ── */}
      <div className="dashboard-header">
        <div>
          <h1>Teacher Dashboard</h1>
          <p className="dashboard-subtitle">
            Your class overview &amp; quick actions
          </p>
        </div>
      </div>

      {/* ── My Class Widget ── */}
      <div className="dashboard-widget">
        <div className="dashboard-widget-header">
          <span className="dashboard-widget-icon">🏫</span>
          <h3>My Class</h3>
        </div>

        {myClass && mySection ? (
          <div className="dashboard-widget-body">
            <div className="dashboard-stat-row">
              <div className="dashboard-stat">
                <div className="dashboard-stat-label">Class</div>
                <div className="dashboard-stat-value">{myClass.ClassName}</div>
              </div>
              <div className="dashboard-stat">
                <div className="dashboard-stat-label">Section</div>
                <div className="dashboard-stat-value">{mySection.name}</div>
              </div>
              <div className="dashboard-stat">
                <div className="dashboard-stat-label">Active Students</div>
                <div className="dashboard-stat-value">{myStudents.length}</div>
              </div>
            </div>
          </div>
        ) : (
          <p className="dashboard-muted">
            You are not assigned as a class teacher yet. Contact the admin to
            assign you to a class section.
          </p>
        )}
      </div>

      {/* ── Students Preview Widget ── */}
      <div className="dashboard-widget">
        <div className="dashboard-widget-header">
          <span className="dashboard-widget-icon">👨‍🎓</span>
          <h3>Students Preview</h3>
        </div>

        {myStudents.length === 0 ? (
          <p className="dashboard-muted">No students to show.</p>
        ) : (
          <>
            <ul className="student-preview-list">
              {myStudents.slice(0, 5).map((s) => (
                <li key={s.id} className="student-preview-item">
                  <div className="student-preview-initials">
                    {s.firstName.charAt(0)}{s.lastName.charAt(0)}
                  </div>
                  <span>{s.firstName} {s.lastName}</span>
                </li>
              ))}
            </ul>
            {myStudents.length > 5 && (
              <p className="dashboard-muted" style={{ marginTop: 8 }}>
                +{myStudents.length - 5} more students
              </p>
            )}
          </>
        )}

        <Link className="dashboard-link" to="/students">
          View Full Student List →
        </Link>
      </div>

      {/* ── Quick Actions ── */}
      <div className="dashboard-widget">
        <div className="dashboard-widget-header">
          <span className="dashboard-widget-icon">⚡</span>
          <h3>Quick Actions</h3>
        </div>

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