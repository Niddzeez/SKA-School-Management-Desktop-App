"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// Auth module (Phase 8)
const auth_routes_1 = __importDefault(require("./auth/routes/auth.routes"));
const requireAuth_1 = require("./auth/middleware/requireAuth");
const requireRole_1 = require("./auth/middleware/requireRole");
// Observability (Phase 12)
const request_id_1 = require("./shared/observability/request-id");
const request_logger_1 = require("./shared/observability/request-logger");
// Identity subsystem routes (MongoDB)
const students_routes_1 = __importDefault(require("./identity/routes/students.routes"));
const classes_routes_1 = __importDefault(require("./identity/routes/classes.routes"));
const sections_routes_1 = __importDefault(require("./identity/routes/sections.routes"));
const teachers_routes_1 = __importDefault(require("./identity/routes/teachers.routes"));
// Finance subsystem routes (PostgreSQL) — Phase 4/5 read + write
const academic_years_routes_1 = __importDefault(require("./finance/routes/academic-years.routes"));
const ledgers_routes_1 = __importDefault(require("./finance/routes/ledgers.routes"));
const expenses_routes_1 = __importDefault(require("./finance/routes/expenses.routes"));
const receipts_routes_1 = __importDefault(require("./finance/routes/receipts.routes"));
// Finance reporting & receipt detail (Phase 6 & 7)
const reports_routes_1 = __importDefault(require("./finance/routes/reports.routes"));
const receipt_detail_routes_1 = __importDefault(require("./finance/routes/receipt-detail.routes"));
// Activity Feed (Phase 10)
const activity_routes_1 = __importDefault(require("./system/routes/activity.routes"));
// Finance Checker
const financeConsistency_routes_1 = __importDefault(require("./system/routes/financeConsistency.routes"));
const ledgerReplay_routes_1 = __importDefault(require("./system/routes/ledgerReplay.routes"));
const ledgerTimeline_routes_1 = __importDefault(require("./system/routes/ledgerTimeline.routes"));
// Fee Structure (Phase 13)
const feeStructure_routes_1 = __importDefault(require("./finance/routes/feeStructure.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
}));
app.use(express_1.default.json());
// ── Observability Middleware (Phase 12) ─────────────────────────────────────────
app.use(request_id_1.requestIdMiddleware);
app.use(request_logger_1.requestLoggerMiddleware);
// ── Auth routes (unprotected) ────────────────────────────────────────────────
app.use("/api/auth", auth_routes_1.default);
// ── Middleware aliases for readability ────────────────────────────────────────
const auth = requireAuth_1.requireAuth;
const adminOnly = (0, requireRole_1.requireRole)("ADMIN");
const anyRole = (0, requireRole_1.requireRole)("ADMIN", "TEACHER");
// ── Identity subsystem (MongoDB) ─────────────────────────────────────────────
// Read access: ADMIN + TEACHER
// Write access: ADMIN only
app.use("/api/students", auth, anyRole, students_routes_1.default);
app.use("/api/classes", auth, anyRole, classes_routes_1.default);
app.use("/api/sections", auth, anyRole, sections_routes_1.default);
app.use("/api/teachers", auth, anyRole, teachers_routes_1.default);
// ── Finance subsystem (PostgreSQL) ───────────────────────────────────────────
// Academic years: read access for all roles
app.use("/api/academic-years", auth, anyRole, academic_years_routes_1.default);
// Ledgers: read + write (POST routes inside ledgers.routes.ts will be
// accessible, but the route handlers themselves are the same for all roles.
// Fine-grained write protection is applied below via separate middleware.)
app.use("/api/ledgers", auth, anyRole, ledgers_routes_1.default);
// Expenses: read + write
app.use("/api/expenses", auth, anyRole, expenses_routes_1.default);
// Per-student receipts: read access
app.use("/api/students/:studentId/receipts", auth, anyRole, receipts_routes_1.default);
// ── Reporting & receipt detail (Phase 6 & 7) ─────────────────────────────────
app.use("/api/reports", auth, anyRole, reports_routes_1.default);
app.use("/api/receipts", auth, anyRole, receipt_detail_routes_1.default);
// ── Admin Activity Feed (Phase 10)  ──────────────────────────────────────────
app.use("/api/system/activity", activity_routes_1.default);
app.use("/api/system", financeConsistency_routes_1.default);
app.use("/api/system", ledgerReplay_routes_1.default);
app.use("/api/system", ledgerTimeline_routes_1.default);
// ── Fee Structure ────────────────────────────────────────────────
app.use("/api/fee-structures", feeStructure_routes_1.default);
// ── Admin Dashboard (Phase 11)  ──────────────────────────────────────────────
const dashboard_routes_1 = __importDefault(require("./system/routes/dashboard.routes"));
app.use("/api/dashboard", auth, adminOnly, dashboard_routes_1.default);
// ── Health check (Phase 12) ───────────────────────────────────────────────
const health_routes_1 = __importDefault(require("./system/routes/health.routes"));
app.use("/health", health_routes_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map