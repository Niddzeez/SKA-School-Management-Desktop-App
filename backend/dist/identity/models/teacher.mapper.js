"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapTeacher = void 0;
const mongoose_1 = require("mongoose");
const mapTeacher = (doc) => ({
    id: doc._id instanceof mongoose_1.Types.ObjectId ? doc._id.toString() : doc._id,
    firstName: doc.firstName,
    lastName: doc.lastName,
    phone: doc.phone,
    dob: doc.dob,
    dateOfJoining: doc.dateOfJoining,
    email: doc.email,
    status: doc.status,
    gender: doc.gender,
    information: doc.information,
    currentClass: doc.currentClass,
});
exports.mapTeacher = mapTeacher;
//# sourceMappingURL=teacher.mapper.js.map