export type StudentFeeAdjustment = {
  id: string;

  type: "DISCOUNT" | "CONCESSION" | "WAIVER" | "EXTRA";

  amount: number;               // always absolute amount
  appliesTo?: "TOTAL" | "COMPONENT";

  componentID?: string;         // if applies to a specific fee
  reason?: string;

  createdAt: string;
};


export type StudentFeeLedger = {
  id: string;

  studentID: string;
  classID: string;
  academicYear: string;

  baseFee: number;

  adjustments: StudentFeeAdjustment[];

  finalFee: number;        // baseFee - discounts + extras
  totalPaid: number;
  totalPending: number;

  status: "PAID" | "PARTIAL" | "PENDING";

  lastUpdated: string;
};


// Rules

// Every student has one ledger per academic year

// Ledger is derived, not hand-edited

// Discounts don’t change class fee — only ledger
