import { use, useState } from "react";
import { useClasses } from "../../context/ClassContext";
import { useFeeStructures } from "../../context/FeeStructureContext";
import { useAuth } from "../../context/AuthContext";
import {can} from "../../auth/permissions"

type ComponentDraft = {
  name: string;
  amount: string;
  mandatory: boolean;
};

function FeeStructures() {
  const { classes } = useClasses();
  const {
    feeStructures,
    createFeeStructure,
    addFeeComponent,
    removeFeeComponent,
    activateFeeStructure,
  } = useFeeStructures();

  const [selectedClass, setSelectedClass] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const {role} = useAuth();

  /**
   * Component drafts keyed by feeStructureId
   * This prevents state leakage between cards
   */
  const [componentDrafts, setComponentDrafts] = useState<
    Record<string, ComponentDraft>
  >({});

  const classFeeStructures = feeStructures.filter(
    (fs) =>
      fs.classID === selectedClass &&
      fs.academicYear === academicYear
  );

  const getDraft = (fsId: string): ComponentDraft =>
    componentDrafts[fsId] ?? {
      name: "",
      amount: "",
      mandatory: true,
    };

  const updateDraft = (
    fsId: string,
    updates: Partial<ComponentDraft>
  ) => {
    setComponentDrafts((prev) => ({
      ...prev,
      [fsId]: {
        ...getDraft(fsId),
        ...updates,
      },
    }));
  };

  const resetDraft = (fsId: string) => {
    setComponentDrafts((prev) => ({
      ...prev,
      [fsId]: {
        name: "",
        amount: "",
        mandatory: true,
      },
    }));
  };

  const handleActivate = (feeStructureId: string) => {
  if (!can(role, "VIEW_REPORTS")) {
    alert("You do not have permission to activate fee structures.");
    return;
  }

  const confirmed = window.confirm(
    "Activating this fee structure will affect all new ledgers.\n\nDo you want to continue?"
  );

  if (!confirmed) return;

  activateFeeStructure(feeStructureId);
};


  return (
    <div className="page-container">
      <h1>Fee Structures (Admin)</h1>

      {/* Class + Academic Year */}
      <div className="form-row">
        <select
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

        <input
          type="text"
          placeholder="Academic Year (e.g. 2025-26)"
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
        />

        <button
          disabled={!selectedClass || !academicYear}
          onClick={() =>
            createFeeStructure(selectedClass, academicYear)
          }
        >
          Create Draft
        </button>
      </div>

      {/* Fee Structures */}
      {classFeeStructures.map((fs) => {
        const total = fs.components.reduce(
          (sum, c) => sum + c.amount,
          0
        );

        const draft = getDraft(fs.id);

        return (
          <div key={fs.id} className="fee-structure-card">
            <h3>
              {fs.status === "ACTIVE"
                ? "🟢 ACTIVE"
                : "📝 DRAFT"}
            </h3>

            <p>
              <strong>Total Fee:</strong> ₹{total}
            </p>

            {/* Components List */}
            <ul>
              {fs.components.map((c) => (
                <li key={c.id}>
                  {c.name} – ₹{c.amount}{" "}
                  {c.mandatory ? "(Mandatory)" : "(Optional)"}
                  {fs.status === "DRAFT" && (
                    <button
                      onClick={() =>
                        removeFeeComponent(fs.id, c.id)
                      }
                      style={{ marginLeft: "8px" }}
                    >
                      ❌
                    </button>
                  )}
                </li>
              ))}
            </ul>

            {/* Add Component (Draft only) */}
            {fs.status === "DRAFT" && (
              <div className="component-form">
                <input
                  type="text"
                  placeholder="Component name"
                  value={draft.name}
                  onChange={(e) =>
                    updateDraft(fs.id, {
                      name: e.target.value,
                    })
                  }
                />

                <input
                  type="number"
                  placeholder="Amount"
                  value={draft.amount}
                  onChange={(e) =>
                    updateDraft(fs.id, {
                      amount: e.target.value,
                    })
                  }
                />

                <label
                  style={{
                    display: "block",
                    marginTop: "6px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={draft.mandatory}
                    onChange={(e) =>
                      updateDraft(fs.id, {
                        mandatory: e.target.checked,
                      })
                    }
                  />{" "}
                  Mandatory
                </label>

                <button
                  disabled={!draft.name || !draft.amount}
                  onClick={() => {
                    addFeeComponent(fs.id, {
                      id: crypto.randomUUID(),
                      name: draft.name,
                      amount: Number(draft.amount),
                      mandatory: draft.mandatory,
                    });
                    resetDraft(fs.id);
                  }}
                >
                  Add Component
                </button>
              </div>
            )}

            {/* Activate */}
            {fs.status === "DRAFT" && can(role, "VIEW_REPORTS") && (
              <button
                disabled={fs.components.length === 0}
                onClick={() => handleActivate(fs.id)}
                style={{ marginTop: "8px" }}
              >
                Activate Fee Structure
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default FeeStructures;
