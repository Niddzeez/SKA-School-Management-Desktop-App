import type { Student } from "../types/Student";

export const students: Student[] = [
  {
    id: "SKA-001",
    firstName: "Aarav",
    lastName: "Sharma",
    gender: "Male",
    dateOfBirth: "2014-05-18",

    aadhaarNumber: "1234-5678-9012",
    phoneNumber: "9876543210",
    nationality: "Indian",
    religion: "Hindu",
    caste: "Brahmin",

    address: {
      addressLine: "12, Shanti Nagar",
      city: "Nagpur",
      pinCode: "440015",
    },

    father: {
      name: "Rajesh Sharma",
      occupation: "Business",
      education: "B.Com",
      phone: "9876543210",
    },

    mother: {
      name: "Sunita Sharma",
      occupation: "Homemaker",
      education: "12th Pass",
        phone: "8765432109",
    },

    academic: {
      grade: "5",
      dateOfAdmission: "2022-06-10",
      discountFeePercent: 10,
      previousSchool: "Little Flowers' School",
      section: "A",
    },

    totalSiblings: 1,
    pictureUrl: "https://example.com/students/aarav.jpg",
  },

  {
    id: "SKA-002",
    firstName: "Ananya",
    lastName: "Patil",
    gender: "Female",
    dateOfBirth: "2013-11-02",

    aadhaarNumber: "2345-6789-0123",
    phoneNumber: "9123456789",
    nationality: "Indian",

    address: {
      addressLine: "45, Pratap Nagar",
      city: "Pune",
      pinCode: "411045",
    },

    father: {
      name: "Suresh Patil",
      occupation: "Government Officer",
      education: "M.A.",
        phone: "9123456789",
    },

    mother: {
      name: "Meena Patil",
      occupation: "Teacher",
      education: "B.Ed",
        phone: "9012345678",
    },

    academic: {
      grade: "6",
      dateOfAdmission: "2021-06-15",
      section: "B",
    },

    totalSiblings: 0,
  },

  {
    id: "SKA-003",
    firstName: "Rohan",
    lastName: "Kale",
    gender: "Male",
    dateOfBirth: "2015-01-25",

    phoneNumber: "9988776655",
    nationality: "Indian",

    address: {
      addressLine: "7, Ganesh Colony",
      city: "Ahmednagar",
      pinCode: "414001",
    },

    father: {
      name: "Mahesh Kale",
      occupation: "Farmer",
      education: "10th Pass",
        phone: "9988776655",
    },

    mother: {
      name: "Anita Kale",
      occupation: "Homemaker",
      education: "8th Pass",
        phone: "8877665544",
    },

    academic: {
      grade: "4",
      dateOfAdmission: "2023-06-05",
      previousSchool: "Zilla Parishad School",
      section: "C",
    },

    totalSiblings: 2,
  },
];
