import { Types } from "mongoose";

export const mapClass = (doc: any) => ({
  id: doc._id instanceof Types.ObjectId ? doc._id.toString() : doc._id,
  ClassName: doc.ClassName,
});
