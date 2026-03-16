import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import { UserModel } from "../../identity/models/User.model";
import {
    ConflictError,
    NotFoundError,
    ValidationError,
} from "../../shared/error";
import type { JwtPayload } from "../types";

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = "24h";

function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not set in environment");
    }
    return secret;
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

export interface RegisterInput {
    name: string;
    email: string;
    password: string;
    role: "ADMIN" | "TEACHER";
}

export interface UserResponse {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
}

/**
 * Creates a new user with a bcrypt-hashed password.
 * Throws ConflictError if the email already exists.
 */
export async function registerUser(input: RegisterInput): Promise<UserResponse> {
    // Check for duplicate email
    const existing = await UserModel.findOne({ email: input.email.toLowerCase() }).lean();
    if (existing) {
        throw new ConflictError(`User with email '${input.email}' already exists`);
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const doc = await UserModel.create({
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash,
        role: input.role,
    });

    return mapUser(doc.toObject());
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

export interface LoginResult {
    token: string;
    userId: string;
    name: string;
    role: string;
}

/**
 * Authenticates a user by email and password.
 * Returns a signed JWT token and user info.
 */
export async function loginUser(
    email: string,
    password: string
): Promise<LoginResult> {
    const user = await UserModel.findOne({
        email: email.toLowerCase(),
        status: "ACTIVE",
    }).lean();

    if (!user) {
        throw new ValidationError("Invalid email or password");
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
        throw new ValidationError("Invalid email or password");
    }

    const jti = randomUUID();
    const payload: JwtPayload = {
        userId: String(user._id),
        role: user.role as "ADMIN" | "TEACHER",
        jti
    };

    const token = jwt.sign(payload, getJwtSecret(), { expiresIn: TOKEN_EXPIRY });

    return {
        token,
        userId: String(user._id),
        name: user.name,
        role: user.role,
    };
}

// ---------------------------------------------------------------------------
// Token verification
// ---------------------------------------------------------------------------

/**
 * Verifies and decodes a JWT token.
 * Throws if the token is invalid or expired.
 */
export function verifyToken(token: string): JwtPayload {
    try {
        const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
        return { userId: decoded.userId, role: decoded.role };
    } catch {
        throw new ValidationError("Invalid or expired token");
    }
}

// ---------------------------------------------------------------------------
// User count (for first-user bootstrapping)
// ---------------------------------------------------------------------------

export async function getUserCount(): Promise<number> {
    return UserModel.countDocuments();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapUser(doc: any): UserResponse {
    return {
        id: String(doc._id),
        name: doc.name,
        email: doc.email,
        role: doc.role,
        status: doc.status,
        createdAt: doc.createdAt instanceof Date
            ? doc.createdAt.toISOString()
            : String(doc.createdAt),
    };
}
