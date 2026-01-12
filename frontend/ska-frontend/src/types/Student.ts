export type ParentInfo = {
  name: string;
  occupation?: string;
  education?: string;
  phone?: string;  // string, not number
  aadhaar?: string; // string, not number
  income?: number;
};

export type StudentStatus = "Active" | "Inactive" | "Alumni" | "Transferred";

export type Address = {
  addressLine?: string;
  city?: string;
  state?: string;
  pinCode?: string;
};

export type AcademicInfo = {
  dateOfAdmission?: string;
  discountFeePercent?: number;
  previousSchool?: string;
  rollNumber?: string;
};

export type Student = {
  id: string;

  firstName: string;
  lastName: string;
  gender: "Male" | "Female" | "Other";
  dateOfBirth: string;
  classID?: string;
  sectionID?: string;




  email?: string;
  aadhaarNumber?: string;       // string, not number
  phoneNumber: string;          // string, not number
  nationality: string;
  religion?: string;
  caste?: string;
  category?: string;
  minorityStatus?: string;
  disabilityStatus?: string;
  medicalConditions?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  guardianName?: string;
  transportationNeeds?: string;
  status: StudentStatus;


  address: Address;

  father: ParentInfo;
  mother: ParentInfo;

  academic: AcademicInfo;

  totalSiblings?: number;
  pictureUrl?: string;
};

