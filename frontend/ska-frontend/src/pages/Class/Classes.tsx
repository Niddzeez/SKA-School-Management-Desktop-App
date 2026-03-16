import { useState } from "react";
import { useClasses } from "../../context/ClassContext";
import { useSections } from "../../context/SectionContext";
import { useTeachers } from "../../context/TeacherContext";
import "../../styles/Classes.css";
import ClassRegisterModal from "./ClassRegisterModal";

const GRADIENTS = [
  "linear-gradient(135deg, #00b894, #00cec9)",
  "linear-gradient(135deg, #0984e3, #6c5ce7)",
  "linear-gradient(135deg, #e17055, #d63031)",
  "linear-gradient(135deg, #fdcb6e, #e17055)",
  "linear-gradient(135deg, #a29bfe, #6c5ce7)",
  "linear-gradient(135deg, #55efc4, #00b894)",
];

function Classes() {
  const { classes }                                                = useClasses();
  const { sections, addSection, deleteSection, assignClassTeacher } = useSections();
  const { teachers }                                               = useTeachers();

  const [selectedClassId, setSelectedClassId]   = useState<string | null>(null);
  const [newSectionNames, setNewSectionNames]   = useState<Record<string, string>>({});
  const [sectionErrors, setSectionErrors]       = useState<Record<string, string>>({});
  const [registerSection, setRegisterSection]   = useState<{
    sectionId: string;
    sectionName: string;
    className: string;
  } | null>(null);

  const panelOpen    = selectedClassId !== null;
  const selectedClass = classes.find((c) => c.id === selectedClassId) ?? null;
  const selectedSections = selectedClass
    ? sections.filter((s) => s.classID === selectedClass.id)
    : [];

  /* ── Sequential validation ── */
  function getNextExpectedSection(classID: string): string {
    const count = sections.filter((s) => s.classID === classID).length;
    return String.fromCharCode(65 + count);
  }

  function validateSection(classID: string, input: string): string | null {
    const val = input.trim().toUpperCase();
    if (!val)                    return "Please enter a section letter.";
    if (!/^[A-Z]$/.test(val))   return "Only a single letter (A–Z) is allowed.";

    const classSecs = sections.filter((s) => s.classID === classID);
    if (classSecs.some((s) => s.name.toUpperCase() === val))
      return `Section ${val} already exists.`;

    const expected = String.fromCharCode(65 + classSecs.length);
    if (val !== expected)
      return `Sections must be added in order. Next expected: ${expected}.`;

    return null;
  }

  /* ── Add section ── */
  const handleAddSection = (classID: string) => {
    const raw   = newSectionNames[classID] || "";
    const error = validateSection(classID, raw);
    if (error) {
      setSectionErrors((prev) => ({ ...prev, [classID]: error }));
      return;
    }
    addSection({ id: crypto.randomUUID(), classID, name: raw.trim().toUpperCase() });
    setNewSectionNames((prev) => ({ ...prev, [classID]: "" }));
    setSectionErrors((prev)   => ({ ...prev, [classID]: "" }));
  };

  const handleSectionInput = (classID: string, value: string) => {
    setNewSectionNames((prev) => ({ ...prev, [classID]: value.toUpperCase().slice(0, 1) }));
    setSectionErrors((prev)   => ({ ...prev, [classID]: "" }));
  };

  /* ── Render ── */
  return (
    <div className="classes-root">

      {/* ── Top bar ── */}
      <div className="classes-topbar">
        <div>
          <h1 className="classes-topbar-title">Classes & Sections</h1>
          <p className="classes-topbar-sub">
            {panelOpen
              ? "Click a class to switch · scroll the list on the left"
              : "Click any class card to manage its sections"}
          </p>
        </div>
      </div>

      {/* ══════════════════════════════
          MASTER — full grid (initial)
          DETAIL  — split when open
      ══════════════════════════════ */}
      <div className={`classes-body${panelOpen ? " split-open" : ""}`}>

        {/* ── Cards pane ── */}
        <div className={`classes-cards-pane${panelOpen ? " pane-narrow" : ""}`}>

          {/* Scrollable inner when split */}
          <div className={panelOpen ? "classes-cards-scroll" : "classes-cards-grid"}>

            {panelOpen && (
              <div className="pane-list-label">All Classes</div>
            )}

            {classes.map((cls, idx) => {
              const isActive    = selectedClassId === cls.id;
              const gradient    = GRADIENTS[idx % GRADIENTS.length];
              const nextSection = getNextExpectedSection(cls.id);
              const secCount    = sections.filter((s) => s.classID === cls.id).length;
              const error       = sectionErrors[cls.id];

              return (
                <div
                  key={cls.id}
                  className={`cls-card${isActive ? " cls-card-active" : ""}`}
                  onClick={() => setSelectedClassId(cls.id)}
                >
                  <div className="cls-card-top" style={{ background: gradient }}>
                    <div className="cls-card-name">Class {cls.ClassName}</div>
                    <div className="cls-card-count">
                      {secCount === 0
                        ? "No sections yet"
                        : `${secCount} section${secCount > 1 ? "s" : ""}`}
                    </div>
                  </div>

                  <div
                    className="cls-card-body"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="cls-next-hint">
                      Next section: <strong>{nextSection}</strong>
                    </div>
                    <div className="cls-add-row">
                      <input
                        className="cls-add-input"
                        type="text"
                        maxLength={1}
                        placeholder={`Add ${nextSection}`}
                        value={newSectionNames[cls.id] || ""}
                        onChange={(e) => handleSectionInput(cls.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddSection(cls.id);
                        }}
                      />
                      <button
                        className="cls-add-btn"
                        onClick={() => handleAddSection(cls.id)}
                      >
                        Add
                      </button>
                    </div>
                    {error && <div className="cls-error">{error}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Detail panel (slides in) ── */}
        {panelOpen && selectedClass && (
          <div className="classes-detail-pane">

            {/* Gradient header */}
            <div className="detail-head">
              <div className="detail-head-inner">
                <div>
                  <div className="detail-head-title">
                    Class {selectedClass.ClassName}
                  </div>
                  <span className="detail-head-badge">
                    {selectedSections.length === 0
                      ? "No sections"
                      : `${selectedSections.length} section${selectedSections.length > 1 ? "s" : ""}`}
                  </span>
                  <div className="detail-head-sub">
                    Assign teachers · Generate registers · Manage sections
                  </div>
                </div>
                <button
                  className="detail-close-btn"
                  onClick={() => setSelectedClassId(null)}
                  title="Close panel"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Section rows */}
            <div className="detail-scroll">
              {selectedSections.length === 0 ? (
                <div className="detail-empty">
                  No sections added yet. Use the input on the card to add
                  Section A first.
                </div>
              ) : (
                selectedSections.map((sec) => {
                  const assignedTeacher = teachers.find(
                    (t) => t.id === sec.classTeacherID
                  );
                  return (
                    <div key={sec.id} className="sec-row">

                      <div className="sec-badge">{sec.name}</div>

                      <div className="sec-info">
                        <div className="sec-name">Section {sec.name}</div>
                        <div className="sec-teacher">
                          {assignedTeacher
                            ? `${assignedTeacher.firstName} ${assignedTeacher.lastName}`
                            : "No teacher assigned"}
                        </div>
                      </div>

                      <select
                        className="sec-select"
                        value={sec.classTeacherID || ""}
                        onChange={(e) =>
                          assignClassTeacher(sec.id, e.target.value)
                        }
                      >
                        <option value="">Assign Teacher</option>
                        {teachers
                          .filter((t) => t.status === "Active")
                          .map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.firstName} {t.lastName}
                            </option>
                          ))}
                      </select>

                      <button
                        className="sec-gen-btn"
                        onClick={() =>
                          setRegisterSection({
                            sectionId:   sec.id,
                            sectionName: sec.name,
                            className:   selectedClass.ClassName,
                          })
                        }
                      >
                        📋 Generate Register
                      </button>

                      <button
                        className="sec-del-btn"
                        title="Delete section"
                        onClick={() => deleteSection(sec.id)}
                      >
                        🗑
                      </button>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}
      </div>

      {/* ── Register modal (per-section) ── */}
      {registerSection && (
        <ClassRegisterModal
          sectionId={registerSection.sectionId}
          sectionName={registerSection.sectionName}
          className={registerSection.className}
          onClose={() => setRegisterSection(null)}
        />
      )}
    </div>
  );
}

export default Classes;