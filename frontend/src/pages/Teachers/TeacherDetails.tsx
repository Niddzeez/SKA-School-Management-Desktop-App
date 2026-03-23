import { useParams, useNavigate } from "react-router-dom";
import type { Teacher } from "../../types/Teachers";
import { useTeachers } from "../../context/TeacherContext";
import { useSections } from "../../context/SectionContext";
import { useClasses } from "../../context/ClassContext";
import "./Teachers.css";

function getInitials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function TeacherDetails() {
  const navigate                         = useNavigate();
  const { id }                           = useParams<{ id: string }>();
  const { teachers, updateTeacherStatus } = useTeachers();
  const { sections }                     = useSections();
  const { classes }                      = useClasses();

  const teacher: Teacher | undefined = teachers.find((t) => t.id === id);

  if (!teacher) {
    return (
      <div className="teacher-detail-page">
        <button className="td-back-btn" onClick={() => navigate("/teachers")}>
          ← Back to Teachers
        </button>
        <p style={{ color: "#8e9ab5" }}>Teacher not found.</p>
      </div>
    );
  }

  /* ── Derive class teachership live from SectionContext ──
     This is the source of truth — not teacher.currentClass   */
  const assignedSection = sections.find(
    (s) => s.classTeacherID === teacher.id
  );
  const assignedClass = assignedSection
    ? classes.find((c) => c.id === assignedSection.classID)
    : null;
  const classTeacherLabel =
    assignedClass && assignedSection
      ? `Class ${assignedClass.ClassName} — Section ${assignedSection.name}`
      : null;

  const initials  = getInitials(teacher.firstName, teacher.lastName);
  const isActive  = teacher.status === "Active";
  const subjects  = teacher.information?.subjects ?? [];

  const handleDeactivate = () => {
    updateTeacherStatus(teacher.id, "Inactive");
    navigate("/teachers");
  };

  const handleActivate = () => {
    updateTeacherStatus(teacher.id, "Active");
    navigate("/teachers");
  };

  return (
    <div className="teacher-detail-page">

      <button className="td-back-btn" onClick={() => navigate("/teachers")}>
        ← Back to Teachers
      </button>

      <div className="td-card">

        {/* ── Gradient banner ── */}
        <div className="td-banner">
          <div className="td-banner-avatar">{initials}</div>

          <div className="td-banner-info">
            <div className="td-banner-name">
              {teacher.firstName} {teacher.lastName}
            </div>
            <div className="td-banner-sub">
              {classTeacherLabel
                ? `Class Teacher · ${classTeacherLabel}`
                : "Teacher · Smart Kids Academy"}
            </div>
          </div>

          <div className="td-banner-right">
            <span className={isActive ? "td-status-active" : "td-status-inactive"}>
              {isActive ? "● ACTIVE" : "● INACTIVE"}
            </span>
          </div>
        </div>

        {/* ── Personal info ── */}
        <div className="td-section">
          <div className="td-section-title">Personal Information</div>
          <div className="td-detail-grid">

            <div className="td-detail-item">
              <div className="td-detail-label">Teacher ID</div>
              <div className="td-detail-value" style={{ fontSize: 12, fontFamily: "monospace" }}>
                {teacher.id}
              </div>
            </div>

            <div className="td-detail-item">
              <div className="td-detail-label">Gender</div>
              <div className={`td-detail-value${!teacher.gender ? " muted" : ""}`}>
                {teacher.gender || "—"}
              </div>
            </div>

            <div className="td-detail-item">
              <div className="td-detail-label">Phone</div>
              <div className={`td-detail-value${!teacher.phone ? " muted" : ""}`}>
                {teacher.phone || "—"}
              </div>
            </div>

            {teacher.email && (
              <div className="td-detail-item">
                <div className="td-detail-label">Email</div>
                <div className="td-detail-value">{teacher.email}</div>
              </div>
            )}

            <div className="td-detail-item">
              <div className="td-detail-label">Date of Joining</div>
              <div className={`td-detail-value${!teacher.dateOfJoining ? " muted" : ""}`}>
                {formatDate(teacher.dateOfJoining)}
              </div>
            </div>

            {/* ── Class teachership — live from SectionContext ── */}
            <div className="td-detail-item">
              <div className="td-detail-label">Class Teachership</div>
              <div className={`td-detail-value${!classTeacherLabel ? " muted" : ""}`}>
                {classTeacherLabel ?? "Not assigned"}
              </div>
            </div>

          </div>
        </div>

        {/* ── Additional info ── */}
        <div className="td-section">
          <div className="td-section-title">Additional Information</div>
          <div className="td-detail-grid">

            <div className="td-detail-item">
              <div className="td-detail-label">Qualification</div>
              <div className={`td-detail-value${!teacher.information?.qualification ? " muted" : ""}`}>
                {teacher.information?.qualification || "—"}
              </div>
            </div>

            <div className="td-detail-item">
              <div className="td-detail-label">Experience</div>
              <div className={`td-detail-value${!teacher.information?.experienceYears ? " muted" : ""}`}>
                {teacher.information?.experienceYears
                  ? `${teacher.information.experienceYears} years`
                  : "—"}
              </div>
            </div>

            <div className="td-detail-item">
              <div className="td-detail-label">Emergency Contact</div>
              <div className={`td-detail-value${!teacher.information?.emergencyContact ? " muted" : ""}`}>
                {teacher.information?.emergencyContact || "—"}
              </div>
            </div>

            <div className="td-detail-item">
              <div className="td-detail-label">Blood Group</div>
              <div className={`td-detail-value${!teacher.information?.bloodGroup ? " muted" : ""}`}>
                {teacher.information?.bloodGroup || "—"}
              </div>
            </div>

            <div className="td-detail-item">
              <div className="td-detail-label">Religion</div>
              <div className={`td-detail-value${!teacher.information?.religion ? " muted" : ""}`}>
                {teacher.information?.religion || "—"}
              </div>
            </div>

            <div className="td-detail-item" style={{ gridColumn: "1 / -1" }}>
              <div className="td-detail-label">Subjects</div>
              {subjects.length > 0 ? (
                <div className="td-subjects">
                  {subjects.map((s, i) => (
                    <span key={i} className="td-subject-tag">{s}</span>
                  ))}
                </div>
              ) : (
                <div className="td-detail-value muted">Not specified</div>
              )}
            </div>

          </div>
        </div>

        {/* ── Action bar ── */}
        <div className="td-actions">
          {isActive ? (
            <button className="td-deactivate-btn" onClick={handleDeactivate}>
              Deactivate Teacher
            </button>
          ) : (
            <button className="td-activate-btn" onClick={handleActivate}>
              Activate Teacher
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default TeacherDetails;