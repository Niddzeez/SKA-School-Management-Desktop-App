"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectMongo = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        throw new Error("MONGO_URI not set in .env");
    }
    await mongoose_1.default.connect(uri);
    console.log("🟢 MongoDB connected (identity)");
};
exports.connectMongo = connectMongo;
//# sourceMappingURL=db.js.map