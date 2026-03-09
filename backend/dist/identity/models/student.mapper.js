"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapStudent = void 0;
const mongoose_1 = require("mongoose");
/**
 * Maps a raw Mongoose Student document to the frontend Student TypeScript type.
 *
 * Rules:
 *   - Only fields present in the frontend Student type are emitted
 *   - Mongoose internals (_id, __v, createdAt, updatedAt) are never leaked
 *   - All Date objects are serialised to ISO strings (Fix 10)
 *   - discountFeePercent is not present (removed from model — Fix 11)
 */
const mapStudent = (doc) => ({
    id: doc._id instanceof mongoose_1.Types.ObjectId ? doc._id.toString() : String(doc._id),
    firstName: doc.firstName,
    lastName: doc.lastName,
    gender: doc.gender,
    dateOfBirth: doc.dateOfBirth instanceof Date
        ? doc.dateOfBirth.toISOString()
        : doc.dateOfBirth,
    classID: doc.classID ?? undefined,
    sectionID: doc.sectionID ?? undefined,
    email: doc.email ?? undefined,
    aadhaarNumber: doc.aadhaarNumber ?? undefined,
    phoneNumber: doc.phoneNumber,
    nationality: doc.nationality,
    religion: doc.religion ?? undefined,
    caste: doc.caste ?? undefined,
    category: doc.category ?? undefined,
    minorityStatus: doc.minorityStatus ?? undefined,
    disabilityStatus: doc.disabilityStatus ?? undefined,
    medicalConditions: doc.medicalConditions ?? undefined,
    bloodGroup: doc.bloodGroup ?? undefined,
    emergencyContact: doc.emergencyContact ?? undefined,
    guardianName: doc.guardianName ?? undefined,
    transportationNeeds: doc.transportationNeeds ?? undefined,
    status: doc.status,
    address: doc.address
        ? {
            addressLine: doc.address.addressLine ?? undefined,
            city: doc.address.city ?? undefined,
            state: doc.address.state ?? undefined,
            pinCode: doc.address.pinCode ?? undefined,
        }
        : undefined,
    father: doc.father
        ? {
            name: doc.father.name,
            occupation: doc.father.occupation ?? undefined,
            education: doc.father.education ?? undefined,
            phone: doc.father.phone ?? undefined,
            aadhaar: doc.father.aadhaar ?? undefined,
            income: doc.father.income ?? undefined,
        }
        : undefined,
    mother: doc.mother
        ? {
            name: doc.mother.name,
            occupation: doc.mother.occupation ?? undefined,
            education: doc.mother.education ?? undefined,
            phone: doc.mother.phone ?? undefined,
            aadhaar: doc.mother.aadhaar ?? undefined,
            income: doc.mother.income ?? undefined,
        }
        : undefined,
    academic: doc.academic
        ? {
            dateOfAdmission: doc.academic.dateOfAdmission instanceof Date
                ? doc.academic.dateOfAdmission.toISOString()
                : doc.academic.dateOfAdmission ?? undefined,
            // discountFeePercent intentionally omitted — it is a LedgerAdjustment in PostgreSQL
            previousSchool: doc.academic.previousSchool ?? undefined,
            rollNumber: doc.academic.rollNumber ?? undefined,
        }
        : undefined,
    totalSiblings: doc.totalSiblings ?? undefined,
    pictureUrl: doc.pictureUrl ?? undefined,
});
exports.mapStudent = mapStudent;
//# sourceMappingURL=student.mapper.js.map