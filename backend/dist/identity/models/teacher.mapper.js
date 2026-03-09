"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapTeacher = void 0;
const mongoose_1 = require("mongoose");
/**
 * Maps a raw Mongoose Teacher document to the frontend Teacher TypeScript type.
 *
 * Fixes applied:
 *   - dob serialised to ISO string  (frontend expects string, Mongoose returns Date)
 *   - dateOfJoining serialised to ISO string
 *   - createdAt / updatedAt never emitted (not in the Teacher frontend type)
 */
const mapTeacher = (doc) => ({
    id: doc._id instanceof mongoose_1.Types.ObjectId ? doc._id.toString() : String(doc._id),
    firstName: doc.firstName,
    lastName: doc.lastName,
    phone: doc.phone,
    dob: doc.dob instanceof Date
        ? doc.dob.toISOString()
        : doc.dob,
    dateOfJoining: doc.dateOfJoining instanceof Date
        ? doc.dateOfJoining.toISOString()
        : doc.dateOfJoining,
    email: doc.email ?? undefined,
    status: doc.status,
    gender: doc.gender,
    information: {
        qualification: doc.information.qualification,
        experienceYears: doc.information.experienceYears ?? undefined,
        subjects: doc.information.subjects,
        address: doc.information.address,
        emergencyContact: doc.information.emergencyContact,
        guardian: doc.information.guardian ?? undefined,
        aadhar: doc.information.aadhar,
        bloodGroup: doc.information.bloodGroup ?? undefined,
        religion: doc.information.religion ?? undefined,
    },
    currentClass: doc.currentClass
        ? {
            className: doc.currentClass.className,
            section: doc.currentClass.section,
        }
        : undefined,
});
exports.mapTeacher = mapTeacher;
//# sourceMappingURL=teacher.mapper.js.map