/**
 * Shared canonical types for the Smart Kids Academy backend.
 *
 * These are derived directly from the frontend TypeScript types in:
 *   frontend/ska-frontend/src/types/
 *
 * Backend API responses MUST conform to these shapes exactly so that
 * the frontend can treat the backend as a drop-in replacement for
 * LocalStorage persistence.
 *
 * Rules:
 *   - Identity types live here (Students, Teachers, Classes, Sections)
 *   - Financial types will be added in Phase 3+ (Ledgers, Payments, etc.)
 *   - No financial fields appear on identity types
 */

// ---------------------------------------------------------------------------
// Student
// ---------------------------------------------------------------------------

export type StudentStatus =
    | "Active"
    | "Inactive"
    | "Alumni"
    | "Transferred"
    | "Withdrawn"
    | "Expelled";

export type ParentInfo = {
    name: string;
    occupation?: string;
    education?: string;
    phone?: string;
    aadhaar?: string;
    income?: number;
};

export type Address = {
    addressLine?: string;
    city?: string;
    state?: string;
    pinCode?: string;
};

export type AcademicInfo = {
    dateOfAdmission?: string; // ISO string
    // discountFeePercent intentionally absent — it is a LedgerAdjustment in PostgreSQL
    previousSchool?: string;
    rollNumber?: string;
};

export type Student = {
    id: string;

    firstName: string;
    lastName: string;
    gender: "Male" | "Female" | "Other";
    dateOfBirth: string; // ISO string

    classID?: string;
    sectionID?: string;

    email?: string;
    aadhaarNumber?: string;
    phoneNumber: string;
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

    address?: Address;
    father?: ParentInfo;
    mother?: ParentInfo;
    academic?: AcademicInfo;

    totalSiblings?: number;
    pictureUrl?: string;
};

// ---------------------------------------------------------------------------
// Teacher
// ---------------------------------------------------------------------------

export type CurrentStatus = "Active" | "Inactive";

export type AdditionalInformation = {
    qualification: string;
    experienceYears?: string;
    subjects: string[];
    address: string;
    emergencyContact: string;
    guardian?: string;
    aadhar: string;
    bloodGroup?: string;
    religion?: string;
};

export type ClassAssignment = {
    className: string;
    section: string;
};

export type Teacher = {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    dob: string;         // ISO string
    dateOfJoining: string; // ISO string
    email?: string;
    status: CurrentStatus;
    gender: "Male" | "Female" | "Other";
    information: AdditionalInformation;
    currentClass?: ClassAssignment;
};

// ---------------------------------------------------------------------------
// Class
// ---------------------------------------------------------------------------

export type Class = {
    id: string;
    ClassName: string;
};

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

export type Section = {
    id: string;
    classID: string;
    name: string;
    classTeacherID?: string;
};