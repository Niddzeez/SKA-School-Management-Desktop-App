export type Payment = {
  id: string;

  studentID: string;
  ledgerID: string;

  amount: number;
  paymentDate: string;

  mode: "CASH" | "UPI" | "CARD" | "BANK";
  reference?: string;

  receivedBy: string;
};


//Never edited
//Never deleted
//Ledger recalculates from payments