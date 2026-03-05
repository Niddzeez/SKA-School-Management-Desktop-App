import mongoose, { Schema } from "mongoose";

/**
 * Student identity model — stored in MongoDB (identity subsystem).
 *
 * IMPORTANT: This model must never contain financial data.
 * discountFeePercent has been removed — fee discounts are LedgerAdjustments
 * in PostgreSQL (SYSTEM_RULES.md: financial data stored only in PostgreSQL).
 */

const ParentInfoSchema = new Schema(
    {
        name: { type: String },
        occupation: { type: String },
        education: { type: String },
        phone: { type: String },
        aadhaar: { type: String },
        income: { type: Number },
    },
    { _id: false }
);

const AddressSchema = new Schema(
    {
        addressLine: { type: String },
        city: { type: String },
        state: { type: String },
        pinCode: { type: String },
    },
    { _id: false }
);

const AcademicInfoSchema = new Schema(
    {
        dateOfAdmission: { type: Date },
        // discountFeePercent intentionally removed — belongs in PostgreSQL as a LedgerAdjustment
        previousSchool: { type: String },
        rollNumber: { type: String },
    },
    { _id: false }
);

const StudentSchema = new Schema(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },

        gender: {
            type: String,
            enum: ["Male", "Female", "Other"],
            required: true,
        },

        dateOfBirth: { type: Date, required: true },

        classID: { type: String },
        sectionID: { type: String },

        email: { type: String },
        aadhaarNumber: { type: String },
        phoneNumber: { type: String, required: true },
        nationality: { type: String, required: true },

        religion: { type: String },
        caste: { type: String },
        category: { type: String },
        minorityStatus: { type: String },
        disabilityStatus: { type: String },
        medicalConditions: { type: String },
        bloodGroup: { type: String },
        emergencyContact: { type: String },
        guardianName: { type: String },
        transportationNeeds: { type: String },

        status: {
            type: String,
            enum: [
                "Active",
                "Inactive",
                "Alumni",
                "Transferred",
                "Withdrawn",
                "Expelled",
            ],
            default: "Active",
        },

        address: { type: AddressSchema, required: false },
        father: { type: ParentInfoSchema, required: false },
        mother: { type: ParentInfoSchema, required: false },
        academic: { type: AcademicInfoSchema, required: false },

        totalSiblings: { type: Number },
        pictureUrl: { type: String },
    },
    { timestamps: true }
);

export const Student = mongoose.model("Student", StudentSchema);