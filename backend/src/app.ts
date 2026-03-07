import express from "express";
import cors from "cors";

// Auth module (Phase 8)
import authRoutes from "./auth/routes/auth.routes";
import { requireAuth } from "./auth/middleware/requireAuth";
import { requireRole } from "./auth/middleware/requireRole";

// Observability (Phase 12)
import { requestIdMiddleware } from "./shared/observability/request-id";
import { requestLoggerMiddleware } from "./shared/observability/request-logger";

// Identity subsystem routes (MongoDB)
import studentRoutes from "./identity/routes/students.routes";
import classRoutes from "./identity/routes/classes.routes";
import sectionRoutes from "./identity/routes/sections.routes";
import teacherRoutes from "./identity/routes/teachers.routes";

// Finance subsystem routes (PostgreSQL) — Phase 4/5 read + write
import academicYearRoutes from "./finance/routes/academic-years.routes";
import ledgerRoutes from "./finance/routes/ledgers.routes";
import expenseRoutes from "./finance/routes/expenses.routes";
import receiptRoutes from "./finance/routes/receipts.routes";

// Finance reporting & receipt detail (Phase 6 & 7)
import reportsRoutes from "./finance/routes/reports.routes";
import receiptDetailRoutes from "./finance/routes/receipt-detail.routes";

// Activity Feed (Phase 10)
import activityRoutes from "./system/routes/activity.routes";

// Finance Checker
import financeConsistencyRoutes from "./system/routes/financeConsistency.routes";
import ledgerReplayRoutes from "./system/routes/ledgerReplay.routes";
import ledgerTimelineRoutes from "./system/routes/ledgerTimeline.routes";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// ── Observability Middleware (Phase 12) ─────────────────────────────────────────
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);

// ── Auth routes (unprotected) ────────────────────────────────────────────────
app.use("/api/auth", authRoutes);

// ── Middleware aliases for readability ────────────────────────────────────────
const auth = requireAuth;
const adminOnly = requireRole("ADMIN");
const anyRole = requireRole("ADMIN", "TEACHER");

// ── Identity subsystem (MongoDB) ─────────────────────────────────────────────
// Read access: ADMIN + TEACHER
// Write access: ADMIN only
app.use("/api/students", auth, anyRole, studentRoutes);
app.use("/api/classes", auth, anyRole, classRoutes);
app.use("/api/sections", auth, anyRole, sectionRoutes);
app.use("/api/teachers", auth, anyRole, teacherRoutes);

// ── Finance subsystem (PostgreSQL) ───────────────────────────────────────────
// Academic years: read access for all roles
app.use("/api/academic-years", auth, anyRole, academicYearRoutes);

// Ledgers: read + write (POST routes inside ledgers.routes.ts will be
// accessible, but the route handlers themselves are the same for all roles.
// Fine-grained write protection is applied below via separate middleware.)
app.use("/api/ledgers", auth, anyRole, ledgerRoutes);

// Expenses: read + write
app.use("/api/expenses", auth, anyRole, expenseRoutes);

// Per-student receipts: read access
app.use("/api/students/:studentId/receipts", auth, anyRole, receiptRoutes);

// ── Reporting & receipt detail (Phase 6 & 7) ─────────────────────────────────
app.use("/api/reports", auth, anyRole, reportsRoutes);
app.use("/api/receipts", auth, anyRole, receiptDetailRoutes);

// ── Admin Activity Feed (Phase 10)  ──────────────────────────────────────────
app.use("/api/system/activity", activityRoutes);
app.use("/api/system", financeConsistencyRoutes);
app.use("/api/system", ledgerReplayRoutes);
app.use("/api/system", ledgerTimelineRoutes);

// ── Admin Dashboard (Phase 11)  ──────────────────────────────────────────────
import dashboardRoutes from "./system/routes/dashboard.routes";
app.use("/api/dashboard", auth, adminOnly, dashboardRoutes);

// ── Health check (Phase 12) ───────────────────────────────────────────────
import healthRoutes from "./system/routes/health.routes";
app.use("/health", healthRoutes);

export default app;