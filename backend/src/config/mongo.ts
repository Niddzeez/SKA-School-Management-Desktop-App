import mongoose from "mongoose";

export const connectMongo = async (): Promise<void> => {
    const uri = process.env.MONGO_URI;

    if (!uri) {
        throw new Error("MONGO_URI is not set in environment");
    }

    await mongoose.connect(uri);
    console.log("🟢 MongoDB connected (identity subsystem)");
};