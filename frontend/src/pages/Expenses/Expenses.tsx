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
  id: string;
  category: string;
  description: string;
  amount: number;
  expenseDate: string; // The backend returns expense_date, but mapped differently?? Wait, backend returns standard rows, we might need to map them.
  // Actually the prompt says: Backend returns Expense[] where each expense has:
  // id, category, description, amount, recordedAt, recordedBy. And expenseDate?
  // Let's check backend endpoint, it returns mapExpense which maps expense_date to expenseDate.
  paidTo: string;
  mode: string;
  recordedBy: string;
  reference?: string;
}

function getAcademicYearFromDate(dateStr: string) {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = d.getMonth(); // Jan = 0

  return month >= 2 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

function Expenses() {
  const { addExpense } = useFeeLedger();
  const { isYearClosed, activeYear } = useAcademicYear();

  // Write form state (preserved)
  const [form, setForm] = useState({
    category: "SALARY" as ExpenseCategory,
    amount: "",
    expenseDate: "",
    paidTo: "",
    mode: "CASH",
    reference: "",
    description: "",
  });

  // Read state
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  useEffect(() => {
    async function fetchExpenses() {
      if (!activeYear?.name) return;

      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({ year: activeYear.name });
        if (filterCategory) params.append("category", filterCategory);
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);

        const data = await apiClient.get<Expense[]>(`/api/expenses?${params.toString()}`);
        setExpenses(data);
      } catch (err: any) {
        setError(err.message || "Failed to load expenses");
      } finally {
        setLoading(false);
      }
    }

    fetchExpenses();
  }, [activeYear?.name, filterCategory, fromDate, toDate]);

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddExpense = async () => {
    try {
      await addExpense({
        category: form.category,
        description: form.description,
        amount: Number(form.amount),
        expenseDate: form.expenseDate,
        paidTo: form.paidTo,
        mode: form.mode as "CASH" | "BANK" | "UPI",
        reference: form.reference || undefined,
        recordedBy: "Admin",
      });

      setForm({
        category: "SALARY",
        amount: "",
        expenseDate: "",
        paidTo: "",
        mode: "CASH",
        reference: "",
        description: "",
      });

      // To reflect the new expense, we could optionally re-fetch or optimistically update
      // For now, if the new expense matches active filters, we re-fetch to keep it simple and consistent with backend
      if (!activeYear?.name) return;
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ year: activeYear.name });
      if (filterCategory) params.append("category", filterCategory);
      if (fromDate) params.append("fromDate", fromDate);
      if (toDate) params.append("toDate", toDate);
      const data = await apiClient.get<Expense[]>(`/api/expenses?${params.toString()}`);
      setExpenses(data);
    } catch (err: any) {
      alert(err.message || "Failed to add expense");
    }
  };

  const currentAY = getAcademicYearFromDate(
    new Date().toISOString().slice(0, 10)
  );

  return (
    <div className="expenses-page">
      <h2>Expenses</h2>
      <p className="ay-hint">
        Current Academic Year: <strong>{currentAY}</strong>
      </p>

      <div className="expense-form">
        <InputBox
          label="Category"
          name="category"
          type="select"
          value={form.category}
          options={["SALARY", "UTILITY", "MAINTENANCE", "PURCHASE", "OTHER"]}
          onChange={handleChange}
          required
        />

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
          className="primary-btn"
          disabled={
            !form.amount ||
            !form.expenseDate ||
            !form.paidTo ||
            !form.description ||
            isYearClosed(getAcademicYearFromDate(form.expenseDate))
          }
          onClick={handleAddExpense}
        >
          Add Expense
        </button>
      </div>

      <h3 style={{ marginTop: "32px" }}>Expenses — {activeYear?.name}</h3>

      {/* Filter Section */}
      <div className="expenses-filters flex-row" style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
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

      {loading && <p>Loading expenses...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && expenses.length === 0 && (
        <p>No expenses recorded yet for these filters.</p>
      )}

      {!loading && !error && expenses.length > 0 && (
        <table className="expenses-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Paid To</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id}>
                <td>{new Date(e.expenseDate).toLocaleDateString()}</td>
                <td>{e.category}</td>
                <td>{e.description}</td>
                <td>{e.paidTo}</td>
                <td>₹{e.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Expenses;
