import { Types } from "mongoose";

export const mapSection = (doc: any) => ({
  id: doc._id instanceof Types.ObjectId ? doc._id.toString() : doc._id,
  classID: doc.classID,
  name: doc.name,
  classTeacherID: doc.classTeacherID,
});
