export type CurrentStatus = "Active" | "Inactive" 

export type Additional_Information = {

    qualification : string;
    experienceYears? : string;
    subjects : string[];
    address : string;
    emergencyContact : string;
    guardian? : string;
    aadhar: string;
    bloodGroup?: string;
    religion?: string;

}

export type ClassAssignment = {
    className : string;
    section : string;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  dob : string;
  dateOfJoining: string;
  email? : string;
  status : CurrentStatus;
  gender : "Male" | "Female" | "Other";
  information : Additional_Information;
  currentClass? : ClassAssignment;
}