import { Types } from "mongoose";

export const mapStudent = (doc: any) => {
  return {
    id: doc._id instanceof Types.ObjectId ? doc._id.toString() : doc._id,
    ...doc,
    _id: undefined,
    __v: undefined,
  };
};
