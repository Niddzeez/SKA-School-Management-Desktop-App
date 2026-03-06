import { Router, Request, Response } from "express";
import {
    registerUser,
    loginUser,
    getUserCount,
} from "../services/auth.service";
import { toErrorResponse, ValidationError } from "../../shared/error";
import { validateEmail, validatePassword, validateRole } from "../../shared/validators";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/requireRole";
import type { AuthenticatedRequest } from "../types";

const router = Router();

// ---------------------------------------------------------------------------
// POST /api/auth/register
//
// First-user bootstrapping: if no users exist yet, allows unauthenticated
// registration (to create the initial ADMIN). After that, only authenticated
// ADMINs can create new users.
// ---------------------------------------------------------------------------
router.post("/register", async (req: Request, res: Response) => {
    try {
        const { name, email, password, role } = req.body;

        // --- Validate inputs ---
        if (!name || typeof name !== "string" || !name.trim()) {
            throw new ValidationError("'name' is required");
        }

        const validatedEmail = validateEmail(email);
        validatePassword(password);
        const validatedRole = validateRole(role);

        // --- Authorization check ---
        const count = await getUserCount();
        if (count > 0) {
            // Not first user — require ADMIN auth
            const authReq = req as AuthenticatedRequest;
            const header = req.headers.authorization;

            if (!header || !header.startsWith("Bearer ")) {
                res.status(401).json({ error: "Authentication required. Only ADMIN can register new users." });
                return;
            }

            // Inline verify + role check
            const { verifyToken } = await import("../services/auth.service");
            try {
                const payload = verifyToken(header.slice(7));
                authReq.user = payload;
            } catch {
                res.status(401).json({ error: "Invalid or expired token" });
                return;
            }

            if (authReq.user.role !== "ADMIN") {
                res.status(403).json({ error: "Only ADMIN can register new users" });
                return;
            }
        }

        const user = await registerUser({
            name: name.trim(),
            email: validatedEmail,
            password,
            role: validatedRole,
        });

        res.status(201).json(user);
    } catch (err) {
        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);
    }
});

// ---------------------------------------------------------------------------
// POST /api/auth/login
//
// Authenticates a user and returns a JWT token.
//
// Response: { token, userId, name, role }
// ---------------------------------------------------------------------------
router.post("/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || typeof email !== "string") {
            throw new ValidationError("'email' is required");
        }
        if (!password || typeof password !== "string") {
            throw new ValidationError("'password' is required");
        }

        const result = await loginUser(email, password);
        res.json(result);
    } catch (err) {
        // Login failures return 401 instead of the default status
        const { status, body } = toErrorResponse(err);
        const finalStatus = status === 400 ? 401 : status;
        res.status(finalStatus).json(body);
    }
});

// ---------------------------------------------------------------------------
// GET /api/auth/me
//
// Returns the current user's info from the token.
// Requires authentication.
// ---------------------------------------------------------------------------
router.get(
    "/me",
    requireAuth as any,
    requireRole("ADMIN", "TEACHER") as any,
    async (req: Request, res: Response) => {
        const authReq = req as AuthenticatedRequest;
        res.json({
            userId: authReq.user.userId,
            role: authReq.user.role,
        });
    }
);

export default router;
