export type ParentInfo = {
  name: string;
  occupation: string;
  education: string;
  phone: string;  // string, not number
};

export type Address = {
  addressLine: string;
  city: string;
  pinCode: string;
};

export type AcademicInfo = {
  grade: string;
  dateOfAdmission: string;
  discountFeePercent?: number;
  previousSchool?: string;
  section: string;
  rollNumber?: string;
};

export type Student = {
  id: string;

  firstName: string;
  lastName: string;
  gender: "Male" | "Female" | "Other";
  dateOfBirth: string;

  aadhaarNumber?: string;       // string, not number
  phoneNumber: string;          // string, not number
  nationality: string;
  religion?: string;
  caste?: string;

  address: Address;

  father: ParentInfo;
  mother: ParentInfo;

  academic: AcademicInfo;

  totalSiblings: number;
  pictureUrl?: string;
};

