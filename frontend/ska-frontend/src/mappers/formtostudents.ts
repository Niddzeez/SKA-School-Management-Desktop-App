import type { Student } from "../types/Student";

//we need FormData type to represent the structure of the admission form data
// we use it in mapFormDataToStudent function
// Define the structure of the form data

// be careful with optional fields and their types

type FormData = {
  firstName: string;
  lastName: string;
  dob: string;
  gender: "Male" | "Female" | "Other";

  email?: string;
  aadhaar: string;
  phone: string;

  nationality?: string;
  religion?: string;
  caste?: string;
  category?: string;
  minorityStatus?: string;
  disabilityStatus?: string;

  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;

  grade: string;
  admissionDate?: string;
  feeDiscount?: string;
  previousSchool?: string;

  siblings?: string;

  guardianName?: string;
  emergencyContact: string;
  transport?: string;
  medicalConditions?: string;
  bloodGroup?: string;

  fatherName: string;
  fatherPhone?: string;
  fatherOccupation?: string;
  fatherAadhaar?: string;
  fatherEducation?: string;
  fatherIncome?: string;

  motherName: string;
  motherPhone?: string;
  motherOccupation?: string;
  motherAadhaar?: string;
  motherEducation?: string;
  motherIncome?: string;
};

// Map form data to Student object for adding new student
// This helps us to convert the data we get from the admission form into a Student object
// which we can then use in our application
// The function takes formData as input and returns a Student object
// We generate a unique ID for the student using crypto.randomUUID()
// We also set default values for some fields if they are not provided in the form data
// Be careful with optional fields and type conversions
// we use it in file frontend/ska-frontend/src/pages/AdmissionForm.tsx

export function mapFormDataToStudent(formData: FormData): Student {
  return {
    id: crypto.randomUUID(),

    firstName: formData.firstName.trim(),
    lastName: formData.lastName.trim(),
    gender: formData.gender,
    dateOfBirth: formData.dob,

    status : "Active",

    email: formData.email || undefined,
    aadhaarNumber: formData.aadhaar,
    phoneNumber: formData.phone,

    nationality: formData.nationality || "Indian",
    religion: formData.religion || undefined,
    caste: formData.caste || undefined,
    category: formData.category || undefined,
    minorityStatus: formData.minorityStatus || undefined,
    disabilityStatus: formData.disabilityStatus || undefined,

    medicalConditions: formData.medicalConditions || undefined,
    bloodGroup: formData.bloodGroup || undefined,
    emergencyContact: formData.emergencyContact || undefined,
    guardianName: formData.guardianName || undefined,
    transportationNeeds: formData.transport || undefined,

    address: {
      addressLine: formData.address,
      city: formData.city,
      state: formData.state,
      pinCode: formData.pinCode,
    },

    father: {
      name: formData.fatherName,
      phone: formData.fatherPhone,
      occupation: formData.fatherOccupation || undefined,
      education: formData.fatherEducation || undefined,
      aadhaar: formData.fatherAadhaar || undefined,
      income: formData.fatherIncome
        ? Number(formData.fatherIncome)
        : undefined,
    },

    mother: {
      name: formData.motherName,
      phone: formData.motherPhone || undefined,
      occupation: formData.motherOccupation || undefined,
      education: formData.motherEducation || undefined,
      aadhaar: formData.motherAadhaar || undefined,
      income: formData.motherIncome
        ? Number(formData.motherIncome)
        : undefined,
    },

    academic: {
      grade: formData.grade,
      section: "", // fill later or make optional in model
      dateOfAdmission: formData.admissionDate,
      discountFeePercent: formData.feeDiscount
        ? Number(formData.feeDiscount)
        : undefined,
      previousSchool: formData.previousSchool || undefined,
    },

    totalSiblings: formData.siblings
      ? Number(formData.siblings)
      : 0,

    pictureUrl: undefined,
  };
}
