// src/pages/Reports/filters/AcademicYearSelector.tsx
import { useAcademicYear } from "../../../context/AcademicYearContext";
import "./filters.css";

type Props = {
  academicYear: string;
  onChange: (v: string) => void;
};

function AcademicYearSelector({ academicYear, onChange }: Props) {
  const { availableYears } = useAcademicYear();

  return (
    <div className="filter-group">
      <label>Academic Year</label>

      <select
        value={academicYear}
        onChange={(e) => onChange(e.target.value)}
      >
        {availableYears.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}

export default AcademicYearSelector;
