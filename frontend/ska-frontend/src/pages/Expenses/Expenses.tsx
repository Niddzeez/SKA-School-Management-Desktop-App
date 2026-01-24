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
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = d.getMonth(); // Jan = 0

  // Academic year starts in March
  return month >= 2
    ? `${year}-${year + 1}`
    : `${year - 1}-${year}`;
}

function Expenses() {
  const { expenses, addExpense } = useFeeLedger();

  const {isYearClosed} = useAcademicYear();

  const [form, setForm] = useState({
    category: "SALARY" as ExpenseCategory,
    amount: "",
    expenseDate: "",
    paidTo: "",
    mode: "CASH",
    reference: "",
    description: "",
  });

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddExpense = () => {
    addExpense({
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
  };

  const currentAY = getAcademicYearFromDate(
    new Date().toISOString().slice(0, 10)
  );

  const expensesForCurrentAY = expenses.filter(
    (e) => getAcademicYearFromDate(e.expenseDate) === currentAY
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
          options={[
            "SALARY",
            "UTILITY",
            "MAINTENANCE",
            "PURCHASE",
            "OTHER",
          ]}
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
            !form.description||
            isYearClosed(getAcademicYearFromDate(form.expenseDate))
          }
          onClick={handleAddExpense}
        >
          Add Expense
        </button>
      </div>

      <h3 style={{ marginTop: "32px" }}>
        Expenses — {currentAY}
      </h3>

      {expensesForCurrentAY.length === 0 && (
        <p>No expenses recorded yet.</p>
      )}

      {expensesForCurrentAY.length > 0 && (
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
            {expensesForCurrentAY.map((e) => (
              <tr key={e.id}>
                <td>
                  {new Date(e.expenseDate).toLocaleDateString()}
                </td>
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
