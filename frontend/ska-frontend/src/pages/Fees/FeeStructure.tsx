import { useState } from "react";
import { useClasses } from "../../context/ClassContext";
import { useFeeStructures } from "../../context/FeeStructureContext";
import { useAuth } from "../../context/AuthContext";
import { useAcademicYear } from "../../context/AcademicYearContext";
import { can } from "../../auth/permissions";
import "./FeeStructure.css";

type ComponentDraft = {
  name: string;
  amount: string;
  mandatory: boolean;
};

/* Icon gradient cycles across cards */
const ICON_CLASSES = [
  "fs-icon-1", "fs-icon-2", "fs-icon-3",
  "fs-icon-4", "fs-icon-5", "fs-icon-6",
];

/* Abbreviate class name for the icon badge */
function classAbbr(name: string): string {
  const n = name.trim().toUpperCase();
  if (n.length <= 3) return n;
  const words = n.split(" ");
  if (words.length >= 2) return words.map((w) => w[0]).join("").slice(0, 3);
  return n.slice(0, 3);
}

function FeeStructures() {
  const { classes }                       = useClasses();
  const { availableYears }                = useAcademicYear();
  const {
    feeStructures,
    createFeeStructure,
    addFeeComponent,
    removeFeeComponent,
    activateFeeStructure,
  }                                       = useFeeStructures();
  const { role }                          = useAuth();

  /* ── Create-bar state ── */
  const [selectedClass, setSelectedClass] = useState("");
  const [academicYear, setAcademicYear]   = useState(
    availableYears[0] ?? ""
  );

  /* ── Expanded card ── */
  const [expandedId, setExpandedId]       = useState<string | null>(null);

  /* ── Per-structure component drafts ── */
  const [componentDrafts, setComponentDrafts] = useState<
    Record<string, ComponentDraft>
  >({});

  const getDraft = (fsId: string): ComponentDraft =>
    componentDrafts[fsId] ?? { name: "", amount: "", mandatory: true };

  const updateDraft = (fsId: string, updates: Partial<ComponentDraft>) => {
    setComponentDrafts((prev) => ({
      ...prev,
      [fsId]: { ...getDraft(fsId), ...updates },
    }));
  };

  const resetDraft = (fsId: string) => {
    setComponentDrafts((prev) => ({
      ...prev,
      [fsId]: { name: "", amount: "", mandatory: true },
    }));
  };

  /* ── Activate with permission guard ── */
  const handleActivate = (feeStructureId: string) => {
    if (!role || !can(role, "VIEW_REPORTS")) {
      alert("You do not have permission to activate fee structures.");
      return;
    }
    const confirmed = window.confirm(
      "Activating this fee structure will affect all new ledgers.\n\nDo you want to continue?"
    );
    if (!confirmed) return;
    activateFeeStructure(feeStructureId);
  };

  /* ── Print a single draft card ── */
  const handlePrint = (fsId: string) => {
    setExpandedId(fsId); // ensure it's expanded before printing
    setTimeout(() => window.print(), 150);
  };

  /* ── All fee structures (all classes, all years) ── */
  const allStructures = feeStructures;

  return (
    <div className="fs-page">

      {/* ── Page header ── */}
      <div className="fs-page-header">
        <div>
          <h1 className="fs-page-title">Fee Structures</h1>
          <p className="fs-page-sub">
            Create and manage class fee structures
          </p>
        </div>
      </div>

      {/* ── Create bar ── */}
      <div className="fs-create-bar">

        <div className="fs-create-group">
          <span className="fs-create-label">Class</span>
          <select
            className="fs-create-select"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">Select Class</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                Class {cls.ClassName}
              </option>
            ))}
          </select>
        </div>

        <div className="fs-create-group">
          <span className="fs-create-label">Academic Year</span>
          <select
            className="fs-create-select"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
          >
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>
        </div>

        <button
          className="fs-create-btn"
          disabled={!selectedClass || !academicYear}
          onClick={() => {
            createFeeStructure(selectedClass, academicYear);
            setExpandedId(null);
          }}
        >
          Create Draft
        </button>

      </div>

      {/* ── Fee structure accordion cards ── */}
      {allStructures.length === 0 ? (
        <div className="fs-empty">
          No fee structures yet. Select a class and academic year above to
          create one.
        </div>
      ) : (
        allStructures.map((fs, idx) => {
          const cls      = classes.find((c) => c.id === fs.classID);
          const clsName  = cls ? `Class ${cls.ClassName}` : "Unknown Class";
          const abbr     = cls ? classAbbr(cls.ClassName) : "?";
          const total    = fs.components.reduce((s, c) => s + c.amount, 0);
          const draft    = getDraft(fs.id);
          const isOpen   = expandedId === fs.id;
          const iconCls  = ICON_CLASSES[idx % ICON_CLASSES.length];

          return (
            <div key={fs.id} className="fs-card">

              {/* ── Card top (always visible, click to expand) ── */}
              <div
                className="fs-card-top"
                onClick={() =>
                  setExpandedId(isOpen ? null : fs.id)
                }
              >
                <div className={`fs-class-icon ${iconCls}`}>
                  {abbr}
                </div>

                <div className="fs-card-info">
                  <div className="fs-card-name">{clsName}</div>
                  <div className="fs-card-meta">
                    {fs.academicYear} · {fs.components.length} component
                    {fs.components.length !== 1 ? "s" : ""}
                  </div>
                </div>

                <div className="fs-card-total">
                  ₹{total.toLocaleString("en-IN")}
                </div>

                {fs.status === "DRAFT" ? (
                  <span className="fs-badge-draft">DRAFT</span>
                ) : (
                  <span className="fs-badge-active">ACTIVE</span>
                )}

                <span className={`fs-chevron${isOpen ? " open" : ""}`}>
                  ▼
                </span>
              </div>

              {/* ── Card body (expanded) ── */}
              {isOpen && (
                <div className="fs-card-body">

                  {/* Component list */}
                  {fs.components.length === 0 ? (
                    <div className="fs-no-components">
                      No components added yet. Add one below.
                    </div>
                  ) : (
                    fs.components.map((c) => (
                      <div key={c.id} className="fs-comp-row">
                        <div className="fs-comp-name">{c.name}</div>
                        {c.mandatory ? (
                          <span className="fs-comp-badge-mandatory">
                            Mandatory
                          </span>
                        ) : (
                          <span className="fs-comp-badge-optional">
                            Optional
                          </span>
                        )}
                        <div className="fs-comp-amount">
                          ₹{c.amount.toLocaleString("en-IN")}
                        </div>
                        {fs.status === "DRAFT" && (
                          <button
                            className="fs-comp-del"
                            onClick={() =>
                              removeFeeComponent(fs.id, c.id)
                            }
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))
                  )}

                  {/* Add component — draft only */}
                  {fs.status === "DRAFT" && (
                    <div className="fs-add-row">
                      <input
                        className="fs-add-input fs-add-name"
                        type="text"
                        placeholder="Component name"
                        value={draft.name}
                        onChange={(e) =>
                          updateDraft(fs.id, { name: e.target.value })
                        }
                      />
                      <input
                        className="fs-add-input fs-add-amount"
                        type="number"
                        placeholder="₹ Amount"
                        value={draft.amount}
                        onChange={(e) =>
                          updateDraft(fs.id, { amount: e.target.value })
                        }
                      />
                      <label className="fs-add-check">
                        <input
                          type="checkbox"
                          checked={draft.mandatory}
                          onChange={(e) =>
                            updateDraft(fs.id, {
                              mandatory: e.target.checked,
                            })
                          }
                        />
                        Mandatory
                      </label>
                      <button
                        className="fs-add-comp-btn"
                        disabled={!draft.name || !draft.amount}
                        onClick={() => {
                          addFeeComponent(fs.id, {
                            id:        crypto.randomUUID(),
                            name:      draft.name,
                            amount:    Number(draft.amount),
                            mandatory: draft.mandatory,
                          });
                          resetDraft(fs.id);
                        }}
                      >
                        + Add
                      </button>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="fs-card-actions">

                    {/* Print — always available */}
                    <button
                      className="fs-print-btn"
                      onClick={() => handlePrint(fs.id)}
                    >
                      🖨 Print Draft
                    </button>

                    {/* Activate — draft + admin only */}
                    {fs.status === "DRAFT" &&
                      role &&
                      can(role, "VIEW_REPORTS") && (
                        <button
                          className="fs-activate-btn"
                          disabled={fs.components.length === 0}
                          onClick={() => handleActivate(fs.id)}
                        >
                          ✓ Activate Fee Structure
                        </button>
                      )}

                  </div>

                </div>
              )}

            </div>
          );
        })
      )}
    </div>
  );
}

export default FeeStructures;