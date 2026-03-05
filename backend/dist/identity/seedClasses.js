"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/identity/seedClasses.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const Class_model_1 = require("./models/Class.model");
const FIXED_CLASSES = [
    "Playgroup",
    "Nursery",
    "LKG",
    "UKG",
    "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"
];
async function seed() {
    await mongoose_1.default.connect(process.env.MONGO_URI);
    for (const name of FIXED_CLASSES) {
        await Class_model_1.ClassModel.updateOne({ ClassName: name }, { $setOnInsert: { ClassName: name } }, { upsert: true });
    }
    console.log("✅ Classes seeded");
    process.exit(0);
}
seed();
//# sourceMappingURL=seedClasses.js.map