import type { Teacher } from "../types/Teachers";

export function mapFormDataToTeacher(
  formData: any
): Omit<Teacher, "id"> {

  // ✅ derive subjects FIRST (outside the object)
  const subjects = formData.subjects
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);

  if (subjects.length === 0) {
    throw new Error("Subjects cannot be empty");
  }

  return {
    firstName: formData.firstName.trim(),
    lastName: formData.lastName.trim(),
    phone: formData.phone.trim(),
    email: formData.email || undefined,
    gender: formData.gender,
    dob: formData.dob,
    dateOfJoining: formData.dateOfJoining,
    status: "Active",

    information: {
      qualification: formData.qualification.trim(),
      subjects, // ✅ correct array
      address: formData.address.trim(),
      emergencyContact: formData.emergencyContact.trim(),
      aadhar: formData.aadhar.trim(),
      bloodGroup: formData.bloodGroup || undefined,
      religion: formData.religion || undefined,
      guardian: formData.guardian || undefined,
      experienceYears: formData.yearsOfExperience ? formData.yearsOfExperience.trim() : undefined,
    },

    currentClass:
      formData.className && formData.section
        ? {
            className: formData.className,
            section: formData.section,
          }
        : undefined,
  };
}
