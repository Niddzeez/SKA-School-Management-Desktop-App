import { useState, useEffect } from "react";
import { useFeeLedger } from "../../context/FeeLedgerContext";
import InputBox from "../../components/FormInputBoxes";
import "../../styles/Expenses.css";
import { useAcademicYear } from "../../context/AcademicYearContext";
import { apiClient } from "../../services/apiClient";

type ExpenseCategory =
  | "SALARY"
  | "UTILITY"
  | "MAINTENANCE"
  | "PURCHASE"
  | "OTHER";

interface Expense {
  id:          string;
  category:    string;
  description: string;
  amount:      number;
  expenseDate: string;
  paidTo:      string;
  mode:        string;
  recordedBy:  string;
  reference?:  string;
}

function getAcademicYearFromDate(dateStr: string) {
  const d     = new Date(dateStr);
  const year  = d.getFullYear();
  const month = d.getMonth();
  return month >= 2
    ? `${year}-${year + 1}`
    : `${year - 1}-${year}`;
}

/* Category → emoji icon */
const CATEGORY_ICON: Record<string, string> = {
  SALARY:      "💼",
  UTILITY:     "⚡",
  MAINTENANCE: "🔧",
  PURCHASE:    "🛒",
  OTHER:       "📌",
};

function Expenses() {
  const { addExpense }                       = useFeeLedger();
  const { isYearClosed, activeYear }         = useAcademicYear();

  /* ── Form state ── */
  const [form, setForm] = useState({
    category:    "SALARY" as ExpenseCategory,
    amount:      "",
    expenseDate: "",
    paidTo:      "",
    mode:        "CASH",
    reference:   "",
    description: "",
  });

  /* ── Read state (from backend) ── */
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading,  setLoading]  = useState<boolean>(false);
  const [error,    setError]    = useState<string | null>(null);

  /* ── Filter state ── */
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [fromDate,        setFromDate]       = useState<string>("");
  const [toDate,          setToDate]         = useState<string>("");

  /* ── Fetch expenses from backend ── */
  const fetchExpenses = async () => {
    if (!activeYear?.name) return;
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ year: activeYear.name });
      if (filterCategory) params.append("category", filterCategory);
      if (fromDate)        params.append("from", fromDate);
      if (toDate)          params.append("to",   toDate);
      const data = await apiClient.get<Expense[]>(`/api/expenses?${params.toString()}`);
      setExpenses(data);
    } catch (err: any) {
      setError(err.message || "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [activeYear?.name, filterCategory, fromDate, toDate]);

  /* ── Handlers ── */
  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const [submitting, setSubmitting] = useState(false);

  const handleAddExpense = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      await addExpense({
        category:    form.category,
        description: form.description,
        amount:      Number(form.amount),
        expenseDate: form.expenseDate,
        paidTo:      form.paidTo,
        mode:        form.mode as "CASH" | "BANK" | "UPI",
        reference:   form.reference || undefined,
        recordedBy:  "Admin",
      });

      setForm({
        category:    "SALARY",
        amount:      "",
        expenseDate: "",
        paidTo:      "",
        mode:        "CASH",
        reference:   "",
        description: "",
      });

      // Re-fetch to reflect new expense from backend
      await fetchExpenses();
    } catch (err: any) {
      alert(err.message || "Failed to add expense");
    }
  };

  const isFormDisabled =
    !form.amount      ||
    !form.expenseDate ||
    !form.paidTo      ||
    !form.description ||
    isYearClosed(getAcademicYearFromDate(form.expenseDate));

  /* ── KPI calculations from fetched expenses ── */
  const totalExpenses  = expenses.reduce((s, e) => s + e.amount, 0);
  const now            = new Date();
  const thisMonthExp   = expenses.filter((e) => {
    const d = new Date(e.expenseDate);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthTotal = thisMonthExp.reduce((s, e) => s + e.amount, 0);
  const thisMonthName  = now.toLocaleString("en-IN", { month: "long", year: "numeric" });

  /* ── Render ── */
  return (
    <div className="exp-page">

      {/* ── Page header ── */}
      <div className="exp-page-header">
        <div>
          <h1 className="exp-page-title">Expenses</h1>
          <p className="exp-page-sub">Track and manage all school expenses</p>
        </div>
        <span className="exp-year-badge">
          Academic Year {activeYear?.name}
        </span>
      </div>

      {/* ── KPI Summary Row ── */}
      <div className="exp-kpi-row">

        <div className="exp-kpi exp-kpi-total">
          <div className="exp-kpi-label">Total Expenses</div>
          <div className="exp-kpi-value">
            ₹{totalExpenses.toLocaleString("en-IN")}
          </div>
          <div className="exp-kpi-sub">Academic Year {activeYear?.name}</div>
        </div>

        <div className="exp-kpi exp-kpi-month">
          <div className="exp-kpi-label">This Month</div>
          <div className="exp-kpi-value">
            ₹{thisMonthTotal.toLocaleString("en-IN")}
          </div>
          <div className="exp-kpi-sub">{thisMonthName}</div>
        </div>

        <div className="exp-kpi exp-kpi-count">
          <div className="exp-kpi-label">Total Entries</div>
          <div className="exp-kpi-value">{expenses.length}</div>
          <div className="exp-kpi-sub">Recorded expenses</div>
        </div>

      </div>

      {/* ── Body: form left + list right ── */}
      <div className="exp-body">

        {/* ── Add Expense Form ── */}
        <div className="exp-form-card">
          <div className="exp-form-head">
            <div className="exp-form-head-icon">💸</div>
            <div>
              <div className="exp-form-head-title">Add New Expense</div>
              <div className="exp-form-head-sub">Fill in the details below</div>
            </div>
          </div>

          <div className="exp-form-body">
            <InputBox
              label="Category"
              name="category"
              type="select"
              value={form.category}
              options={["SALARY", "UTILITY", "MAINTENANCE", "PURCHASE", "OTHER"]}
              onChange={handleChange}
              required
            />

            <div className="exp-form-2col">
              <InputBox
                label="Amount"
                name="amount"
                type="text"
                value={form.amount}
                numericOnly
                onChange={handleChange}
                required
              />
              <InputBox
                label="Expense Date"
                name="expenseDate"
                type="date"
                value={form.expenseDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="exp-form-2col">
              <InputBox
                label="Paid To"
                name="paidTo"
                type="text"
                value={form.paidTo}
                onChange={handleChange}
                required
              />
              <InputBox
                label="Payment Mode"
                name="mode"
                type="select"
                value={form.mode}
                options={["CASH", "BANK", "UPI"]}
                onChange={handleChange}
                required
              />
            </div>

            <InputBox
              label="Reference (optional)"
              name="reference"
              type="text"
              value={form.reference}
              onChange={handleChange}
            />

            <InputBox
              label="Description"
              name="description"
              type="textarea"
              value={form.description}
              onChange={handleChange}
              required
            />

            <button
              className="exp-submit-btn"
              disabled={isFormDisabled}
              onClick={handleAddExpense}
            >
              + Add Expense
            </button>
          </div>
        </div>

        {/* ── Expense List ── */}
        <div className="exp-list-card">
          <div className="exp-list-head">
            <div className="exp-list-title">Recent Expenses</div>
            <span className="exp-list-badge">
              {expenses.length === 0
                ? "No entries"
                : `${expenses.length} entr${expenses.length > 1 ? "ies" : "y"}`}
            </span>
          </div>

          {/* ── Filters ── */}
          <div className="exp-filters">
            <InputBox
              label="Filter Category"
              name="filterCategory"
              type="select"
              value={filterCategory}
              options={["", "SALARY", "UTILITY", "MAINTENANCE", "PURCHASE", "OTHER"]}
              onChange={(_, val) => setFilterCategory(val)}
            />
            <InputBox
              label="From Date"
              name="fromDate"
              type="date"
              value={fromDate}
              onChange={(_, val) => setFromDate(val)}
            />
            <InputBox
              label="To Date"
              name="toDate"
              type="date"
              value={toDate}
              onChange={(_, val) => setToDate(val)}
            />
          </div>

          <div className="exp-list-body">

            {/* Loading */}
            {loading && (
              <div className="exp-empty">Loading expenses…</div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="exp-empty" style={{ color: "#e17055" }}>
                {error}
              </div>
            )}

            {/* Empty */}
            {!loading && !error && expenses.length === 0 && (
              <div className="exp-empty">
                No expenses recorded for these filters.
              </div>
            )}

            {/* Expense rows */}
            {!loading && !error && expenses.length > 0 &&
              [...expenses]
                .sort(
                  (a, b) =>
                    new Date(b.expenseDate).getTime() -
                    new Date(a.expenseDate).getTime()
                )
                .map((e) => (
                  <div key={e.id} className="exp-row">
                    <div className="exp-row-icon">
                      {CATEGORY_ICON[e.category] ?? "📌"}
                    </div>
                    <div className="exp-row-info">
                      <div className="exp-row-desc">{e.description}</div>
                      <div className="exp-row-meta">
                        {e.paidTo} · {e.mode}
                      </div>
                      <span className="exp-row-cat">{e.category}</span>
                    </div>
                    <div className="exp-row-right">
                      <div className="exp-row-amount">
                        ₹{e.amount.toLocaleString("en-IN")}
                      </div>
                      <div className="exp-row-date">
                        {new Date(e.expenseDate).toLocaleDateString("en-IN", {
                          day:   "numeric",
                          month: "short",
                          year:  "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                ))
            }
          </div>
        </div>

      </div>
    </div>
  );
}

export default Expenses;