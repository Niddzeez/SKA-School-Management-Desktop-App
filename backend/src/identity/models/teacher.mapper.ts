import { Types } from "mongoose";

export const mapTeacher = (doc: any) => ({
  id: doc._id instanceof Types.ObjectId ? doc._id.toString() : doc._id,
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
