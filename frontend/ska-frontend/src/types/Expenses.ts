export type Expense = {
  id: string;

  category: "SALARY" | "UTILITY" | "MAINTENANCE" | "PURCHASE" | "OTHER";
  description: string;

  amount: number;
  expenseDate: string;

  paidTo: string;
  mode: "CASH" | "BANK" | "UPI";

  recordedBy: string;
};
