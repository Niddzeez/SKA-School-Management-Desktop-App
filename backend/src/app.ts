import express from "express";
import cors from "cors";

// Identity subsystem routes (MongoDB)
import studentRoutes from "./identity/routes/students.routes";
import classRoutes from "./identity/routes/classes.routes";
import sectionRoutes from "./identity/routes/sections.routes";
import teacherRoutes from "./identity/routes/teachers.routes";

// Finance subsystem routes (PostgreSQL) — Phase 4 read-only
import academicYearRoutes from "./finance/routes/academic-years.routes";
import ledgerRoutes from "./finance/routes/ledgers.routes";
import expenseRoutes from "./finance/routes/expenses.routes";
import receiptRoutes from "./finance/routes/receipts.routes";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ── Identity subsystem (MongoDB) ─────────────────────────────────────────────
app.use("/api/students", studentRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/teachers", teacherRoutes);

// ── Finance subsystem (PostgreSQL) ───────────────────────────────────────────
app.use("/api/academic-years", academicYearRoutes);
app.use("/api/ledgers", ledgerRoutes);
app.use("/api/expenses", expenseRoutes);
// Nested under /api/students to match REST convention: GET /students/:id/receipts
app.use("/api/students/:studentId/receipts", receiptRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default app;