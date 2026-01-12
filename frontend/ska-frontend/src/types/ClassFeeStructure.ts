export type FeeComponent = {
  id: string;
  name: string;          // Tuition, Transport, Exam
  amount: number;        // yearly amount
  mandatory: boolean;
};

export type FeeStructureStatus = "DRAFT" | "ACTIVE";

export type FeeStructure = {
  id: string;

  classID: string;
  academicYear: string;

  components: FeeComponent[];

  status: FeeStructureStatus;   
  createdAt: string;
};


// Rules

// Same for all students in that class

// Immutable once active

// Changing structure affects future students only