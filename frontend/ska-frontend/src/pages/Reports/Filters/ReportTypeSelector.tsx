// src/pages/Reports/filters/ReportTypeSelector.tsx
import "./filters.css";

type Props = {
  granularity: "DAILY" | "MONTHLY" | "HALF_YEARLY" | "YEARLY";
  category: "INCOME" | "EXPENSE" | "COMBINED";
  onGranularityChange: (v: any) => void;
  onCategoryChange: (v: any) => void;
};

function ReportTypeSelector({
  granularity,
  category,
  onGranularityChange,
  onCategoryChange,
}: Props) {
  return (
    <div className="filter-group">
      <label>Report Type</label>

      <select
        value={granularity}
        onChange={(e) => onGranularityChange(e.target.value)}
      >
        <option value="DAILY">Daily</option>
        <option value="MONTHLY">Monthly</option>
        <option value="HALF_YEARLY">Six-Monthly</option>
        <option value="YEARLY">Yearly</option>
      </select>

      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        <option value="INCOME">Income</option>
        <option value="EXPENSE">Expenses</option>
        <option value="COMBINED">Income vs Expenses</option>
      </select>
    </div>
  );
}

export default ReportTypeSelector;
