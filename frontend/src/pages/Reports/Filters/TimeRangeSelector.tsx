// src/pages/Reports/filters/TimeRangeSelector.tsx
import "./filters.css";

type Props = {
  granularity: "DAILY" | "MONTHLY" | "HALF_YEARLY" | "YEARLY";
  selectedDate: string | null;
  selectedMonth: number | null;
  half: "H1" | "H2" | null;
  onDateChange: (v: string | null) => void;
  onMonthChange: (v: number | null) => void;
  onHalfChange: (v: "H1" | "H2" | null) => void;
};

function TimeRangeSelector({
  granularity,
  selectedDate,
  selectedMonth,
  half,
  onDateChange,
  onMonthChange,
  onHalfChange,
}: Props) {
  if (granularity === "YEARLY") return null;

  return (
    <div className="filter-group">
      <label>Time Range</label>

      {granularity === "DAILY" && (
        <input
          type="date"
          value={selectedDate ?? ""}
          onChange={(e) => onDateChange(e.target.value)}
        />
      )}

      {granularity === "MONTHLY" && (
        <select
          value={selectedMonth ?? ""}
          onChange={(e) =>
            onMonthChange(
              e.target.value === "" ? null : Number(e.target.value)
            )
          }
        >
          <option value="">Select Month</option>
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i} value={i}>
              {new Date(2026, i).toLocaleString("default", {
                month: "long",
              })}
            </option>
          ))}
        </select>
      )}

      {granularity === "HALF_YEARLY" && (
        <select
          value={half ?? ""}
          onChange={(e) => onHalfChange(e.target.value as any)}
        >
          <option value="">Select Half</option>
          <option value="H1">March – August</option>
          <option value="H2">September – February</option>
        </select>
      )}
    </div>
  );
}

export default TimeRangeSelector;
