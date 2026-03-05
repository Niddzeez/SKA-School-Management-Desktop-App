import mongoose, { Schema } from "mongoose";

const ClassSchema = new Schema(
  {
    ClassName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export const ClassModel = mongoose.model("Class", ClassSchema);
