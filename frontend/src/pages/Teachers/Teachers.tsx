import { useState } from "react";
import { useTeachers } from "../../context/TeacherContext";
import { useSections } from "../../context/SectionContext";
import { useClasses } from "../../context/ClassContext";
import { useNavigate } from "react-router-dom";
import "../../styles/Teachers.css";              // ✅ correct path from main

function getInitials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function getAge(dob?: string): string {
  if (!dob) return "—";
  const diff = Date.now() - new Date(dob).getTime();
  const age  = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  return isNaN(age) || age < 0 ? "—" : String(age);
}

function Teachers() {
  const { teachers } = useTeachers();
  const { sections } = useSections();
  const { classes }  = useClasses();
  const navigate     = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const activeTeachers = teachers.filter((t) => t.status === "Active");

  const filteredTeachers = activeTeachers.filter((teacher) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;
    const fields = [
      teacher.id,
      teacher.firstName,
      teacher.lastName,
      teacher.phone,
      teacher.currentClass?.className,   // ✅ kept from main
      teacher.currentClass?.section,     // ✅ kept from main
      teacher.gender,
    ];
    return fields.some((f) =>
      String(f ?? "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="teachers-page">

      {/* ── Header ── */}
      <div className="teachers-header">
        <h1>Teachers</h1>
        <div className="teachers-header-right">
          <span className="teachers-count">
            {filteredTeachers.length} teacher{filteredTeachers.length !== 1 ? "s" : ""}
          </span>
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >×</button>
            )}
          </div>
        </div>
      </div>

      {/* ── Teacher Cards Grid ── */}
      <div className="teachers-grid">
        {filteredTeachers.map((teacher) => {
          const initials   = getInitials(teacher.firstName, teacher.lastName);
          const age        = getAge(teacher.dob);
          const experience = teacher.information?.experienceYears
            ? `${teacher.information.experienceYears} yrs`
            : "—";

          /* ── Live class teachership from SectionContext ── */
          const assignedSection = sections.find(
            (s) => s.classTeacherID === teacher.id
          );
          const assignedClass = assignedSection
            ? classes.find((c) => c.id === assignedSection.classID)
            : null;
          const classLabel = assignedClass && assignedSection
            ? `${assignedClass.ClassName} - ${assignedSection.name}`
            : null;

          const genderBadgeClass =
            teacher.gender === "Female" ? "tc-badge tc-badge-female" :
            teacher.gender === "Male"   ? "tc-badge tc-badge-male"   :
            "tc-badge tc-badge-other";

          return (
            <div
              key={teacher.id}
              className="teacher-card"
              onClick={() => navigate(`/teachers/${teacher.id}`)}
            >
              <div className="teacher-card-banner" />

              <div className="teacher-avatar-wrap">
                <div className="teacher-avatar">{initials}</div>
              </div>

              <div className="teacher-card-body">
                <div className="teacher-card-name">
                  {teacher.firstName} {teacher.lastName}
                </div>
                <div className="teacher-card-sub">{teacher.phone}</div>

                <div className="teacher-card-stats">
                  <div>
                    <div className="teacher-stat-val">{age}</div>
                    <div className="teacher-stat-lbl">Age</div>
                  </div>
                  <div>
                    <div className="teacher-stat-val">{experience}</div>
                    <div className="teacher-stat-lbl">Exp</div>
                  </div>
                </div>

                <div className="teacher-card-badges">
                  <span className={genderBadgeClass}>{teacher.gender}</span>
                  {classLabel ? (
                    <span className="tc-badge tc-badge-class">{classLabel}</span>
                  ) : (
                    <span className="tc-badge tc-badge-other">No class assigned</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Empty state ── */}
      {filteredTeachers.length === 0 && searchTerm && (
        <p className="no-result">
          No teachers found matching "{searchTerm}"
        </p>
      )}

    </div>
  );
}

export default Teachers;