import mongoose, { Schema } from "mongoose";

const SectionSchema = new Schema(
  {
    classID: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    classTeacherID: {
      type: String,
    },
  },
  { timestamps: true }
);

// Optional but recommended: prevent duplicate sections in same class
SectionSchema.index({ classID: 1, name: 1 }, { unique: true });

export const SectionModel = mongoose.model("Section", SectionSchema);
