import mongoose, { Schema } from "mongoose";

/**
 * User model for authentication (identity subsystem).
 *
 * Roles: ADMIN (full access), TEACHER (read-only).
 * Passwords are stored as bcrypt hashes — never plaintext.
 */

const UserSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: { type: String, required: true },
        role: {
            type: String,
            enum: ["ADMIN", "TEACHER"],
            required: true,
        },
        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE"],
            default: "ACTIVE",
        },
    },
    { timestamps: true }
);

export const UserModel = mongoose.model("User", UserSchema);
