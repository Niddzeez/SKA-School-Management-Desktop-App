export type Invoice = {
  id: string;
  invoiceNumber: string;

  studentID: string;
  paymentID: string;

  issuedAt: string;
  amount: number;
};
