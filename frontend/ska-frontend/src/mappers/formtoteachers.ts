import type { Teacher  } from "../types/Teachers";


// Define the structure of the form data
type FormData = {
    firstName : string;
    lastName : string;
    phone : string;
    dateOfJoining : string;
    email? : string;
    gender : "Male" | "Female" | "Other";
    dob : string;

    qualification : string ;
    experienceYears? : string;
    subjects : string[];
    address? : string;
    aadhar : string;
    bloodGroup? : string;
    religion? : string;
    emergencyContact : string;
    guardian : string;


    className? : string;
    section? : string;

}

// Map form data to Teacher object for adding new teacher
export function mapFormDataToTeacher(formData : FormData) : Teacher {
    return {

        id : crypto.randomUUID(),
        firstName : formData.firstName.trim(),
        lastName : formData.lastName.trim(),
        phone : formData.phone.trim(),
        dateOfJoining : formData.dateOfJoining,
        email : formData.email?.trim() || undefined,
        gender: formData.gender,
        dob : formData.dob,
        status : "Active",
        information : {
            qualification : formData.qualification.trim(),
            experienceYears : formData.experienceYears?.trim() || undefined,
            subjects : formData.subjects,
            address : formData.address?.trim() || "",
            emergencyContact : formData.emergencyContact.trim(),
            guardian : formData.guardian?.trim() || undefined,
            aadhar : formData.aadhar.trim(),
            bloodGroup : formData.bloodGroup?.trim() || undefined,
            religion : formData.religion?.trim() || undefined,
        },
        currentClass : {
            className : formData.className?.trim() || "",
            section : formData.section?.trim() || "",
        }

    }

}
