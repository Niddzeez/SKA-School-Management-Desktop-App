import { useState } from "react";
import { useClasses } from "../context/ClassContext";
import { useFeeStructures } from "../context/FeeStructureContext";

function FeeStructures() {
  const { classes } = useClasses();
  const {
    feeStructures,
    createFeeStructure,
    activateFeeStructure,
  } = useFeeStructures();

  const [selectedClass, setSelectedClass] = useState("");
  const [academicYear, setAcademicYear] = useState("");

  const classFeeStructures = feeStructures.filter(
    (fs) =>
      fs.classID === selectedClass &&
      fs.academicYear === academicYear
  );

  return (
    <div className="page-container">
      <h1>Fee Structures</h1>

      {/* Select class & year */}
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

      {/* Fee Structure drafts */}
      {classFeeStructures.map((fs) => (
        <div key={fs.id} className="fee-structure-card">
          <h3>
            {fs.status === "ACTIVE" ? "🟢 ACTIVE" : "📝 DRAFT"}
          </h3>

          <p>Components: {fs.components.length}</p>

          {fs.status === "DRAFT" && (
            <button onClick={() => activateFeeStructure(fs.id)}>
              Activate
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default FeeStructures;
