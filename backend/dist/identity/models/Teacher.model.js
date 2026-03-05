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
exports.TeacherModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AdditionalInformationSchema = new mongoose_1.Schema({
    qualification: { type: String, required: true },
    experienceYears: String,
    subjects: { type: [String], required: true },
    address: { type: String, required: true },
    emergencyContact: { type: String, required: true },
    guardian: String,
    aadhar: { type: String, required: true },
    bloodGroup: String,
    religion: String,
}, { _id: false });
const ClassAssignmentSchema = new mongoose_1.Schema({
    className: { type: String, required: true },
    section: { type: String, required: true },
}, { _id: false });
const TeacherSchema = new mongoose_1.Schema({
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
}, { timestamps: true });
exports.TeacherModel = mongoose_1.default.model("Teacher", TeacherSchema);
//# sourceMappingURL=Teacher.model.js.map