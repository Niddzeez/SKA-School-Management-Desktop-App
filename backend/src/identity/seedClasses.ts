// backend/src/identity/seedClasses.ts
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { ClassModel } from "./models/Class.model";


const FIXED_CLASSES = [
  "Playgroup",
  "Nursery",
  "LKG",
  "UKG",
  "1","2","3","4","5","6","7","8","9","10","11","12"
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI!);

  for (const name of FIXED_CLASSES) {
    await ClassModel.updateOne(
      { ClassName: name },
      { $setOnInsert: { ClassName: name } },
      { upsert: true }
    );
  }

  console.log("✅ Classes seeded");
  process.exit(0);
}

seed();
