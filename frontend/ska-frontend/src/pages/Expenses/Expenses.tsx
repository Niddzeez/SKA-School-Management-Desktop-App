import { useState } from "react";
import { useFeeLedger } from "../../context/FeeLedgerContext";
import InputBox from "../../components/FormInputBoxes";
import "../../styles/Expenses.css";
import { useAcademicYear } from "../../context/AcademicYearContext";

type ExpenseCategory =
  | "SALARY"
  | "UTILITY"
  | "MAINTENANCE"
  | "PURCHASE"
  | "OTHER";

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
  const { expenses, addExpense } = useFeeLedger();
  const { isYearClosed }         = useAcademicYear();

  const [form, setForm] = useState({
    category:    "SALARY" as ExpenseCategory,
    amount:      "",
    expenseDate: "",
    paidTo:      "",
    mode:        "CASH",
    reference:   "",
    description: "",
  });

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddExpense = () => {
    addExpense({
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
  };

  const isFormDisabled =
    !form.amount ||
    !form.expenseDate ||
    !form.paidTo ||
    !form.description ||
    isYearClosed(getAcademicYearFromDate(form.expenseDate));

  const currentAY = getAcademicYearFromDate(
    new Date().toISOString().slice(0, 10)
  );

  const expensesForCurrentAY = expenses.filter(
    (e) => getAcademicYearFromDate(e.expenseDate) === currentAY
  );

  /* KPI calculations */
  const totalExpenses   = expensesForCurrentAY.reduce((s, e) => s + e.amount, 0);
  const now             = new Date();
  const thisMonthExp    = expensesForCurrentAY.filter((e) => {
    const d = new Date(e.expenseDate);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthTotal  = thisMonthExp.reduce((s, e) => s + e.amount, 0);
  const thisMonthName   = now.toLocaleString("en-IN", { month: "long", year: "numeric" });

  return (
    <div className="exp-page">

      {/* ── Page header ── */}
      <div className="exp-page-header">
        <div>
          <h1 className="exp-page-title">Expenses</h1>
          <p className="exp-page-sub">Track and manage all school expenses</p>
        </div>
        <span className="exp-year-badge">Academic Year {currentAY}</span>
      </div>

      {/* ── KPI Summary Row ── */}
      <div className="exp-kpi-row">

        <div className="exp-kpi exp-kpi-total">
          <div className="exp-kpi-label">Total Expenses</div>
          <div className="exp-kpi-value">
            ₹{totalExpenses.toLocaleString("en-IN")}
          </div>
          <div className="exp-kpi-sub">Academic Year {currentAY}</div>
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
          <div className="exp-kpi-value">{expensesForCurrentAY.length}</div>
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
              <div className="exp-form-head-sub">
                Fill in the details below
              </div>
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
            <div className="exp-list-title">
              Recent Expenses
            </div>
            <span className="exp-list-badge">
              {expensesForCurrentAY.length === 0
                ? "No entries"
                : `${expensesForCurrentAY.length} entr${expensesForCurrentAY.length > 1 ? "ies" : "y"}`}
            </span>
          </div>

          <div className="exp-list-body">
            {expensesForCurrentAY.length === 0 ? (
              <div className="exp-empty">
                No expenses recorded yet for {currentAY}
              </div>
            ) : (
              [...expensesForCurrentAY]
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
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Expenses;