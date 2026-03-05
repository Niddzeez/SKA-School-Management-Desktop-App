import mongoose, { Schema } from "mongoose";

const ParentInfoSchema = new Schema(
    {
        name: String,
        occupation: String,
        education: String,
        phone: String,
        aadhaar: String,
        income: Number,
    },
    { _id: false }
);

const AddressSchema = new Schema(
    {
        addressLine: String,
        city: String,
        state: String,
        pinCode: String,
    },
    { _id: false }
);

const AcademicInfoSchema = new Schema(
    {
        dateOfAdmission: Date,
        discountFeePercent: Number,
        previousSchool: String,
        rollNumber: String,
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

        classID: String,
        sectionID: String,

        email: String,
        aadhaarNumber: String,
        phoneNumber: { type: String, required: true },
        nationality: { type: String, required: true },

        religion: String,
        caste: String,
        category: String,
        minorityStatus: String,
        disabilityStatus: String,
        medicalConditions: String,
        bloodGroup: String,
        emergencyContact: String,
        guardianName: String,
        transportationNeeds: String,

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

        totalSiblings: Number,
        pictureUrl: String,
    },
    { timestamps: true }
);

export const Student = mongoose.model("Student", StudentSchema);
