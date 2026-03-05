import mongoose, { Schema } from "mongoose";

const AdditionalInformationSchema = new Schema(
  {
    qualification: { type: String, required: true },
    experienceYears: String,
    subjects: { type: [String], required: true },
    address: { type: String, required: true },
    emergencyContact: { type: String, required: true },
    guardian: String,
    aadhar: { type: String, required: true },
    bloodGroup: String,
    religion: String,
  },
  { _id: false }
);

const ClassAssignmentSchema = new Schema(
  {
    className: { type: String, required: true },
    section: { type: String, required: true },
  },
  { _id: false }
);

const TeacherSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },

    phone: { type: String, required: true },

    dob: { type: Date, required: true },
    dateOfJoining: { type: Date, required: true },

    email: String,

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    information: {
      type: AdditionalInformationSchema,
      required: true,
    },

    currentClass: {
      type: ClassAssignmentSchema,
    },
  },
  { timestamps: true }
);

export const TeacherModel = mongoose.model("Teacher", TeacherSchema);
