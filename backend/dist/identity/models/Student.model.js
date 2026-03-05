"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Student = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ParentInfoSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    occupation: String,
    education: String,
    phone: String,
    aadhaar: String,
    income: Number,
}, { _id: false });
const AddressSchema = new mongoose_1.Schema({
    addressLine: String,
    city: String,
    state: String,
    pinCode: String,
}, { _id: false });
const AcademicInfoSchema = new mongoose_1.Schema({
    dateOfAdmission: Date,
    discountFeePercent: Number,
    previousSchool: String,
    rollNumber: String,
}, { _id: false });
const StudentSchema = new mongoose_1.Schema({
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
    address: { type: AddressSchema, required: true },
    father: { type: ParentInfoSchema, required: true },
    mother: { type: ParentInfoSchema, required: true },
    academic: { type: AcademicInfoSchema, required: true },
    totalSiblings: Number,
    pictureUrl: String,
}, { timestamps: true });
exports.Student = mongoose_1.default.model("Student", StudentSchema);
//# sourceMappingURL=Student.model.js.map