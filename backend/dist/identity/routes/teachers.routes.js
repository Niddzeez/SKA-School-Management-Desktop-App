"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Teacher_model_1 = require("../models/Teacher.model");
const teacher_mapper_1 = require("../models/teacher.mapper");
const error_1 = require("../../shared/error");
const validators_1 = require("../../shared/validators");
const requireRole_1 = require("../../auth/middleware/requireRole");
const router = (0, express_1.Router)();
// ---------------------------------------------------------------------------
// GET /api/teachers
// List all teachers
// ---------------------------------------------------------------------------
router.get("/", async (_req, res) => {
    try {
        const teachers = await Teacher_model_1.TeacherModel.find().lean();
        res.json(teachers.map(teacher_mapper_1.mapTeacher));
    }
    catch (err) {
        const { status, body } = (0, error_1.toErrorResponse)(err);
        res.status(status).json(body);
    }
});
// ---------------------------------------------------------------------------
// GET /api/teachers/:id
// Get a single teacher by ID
// ---------------------------------------------------------------------------
router.get("/:id", async (req, res) => {
    try {
        const teacher = await Teacher_model_1.TeacherModel.findById(req.params.id).lean();
        if (!teacher)
            throw new error_1.NotFoundError("Teacher", req.params.id);
        res.json((0, teacher_mapper_1.mapTeacher)(teacher));
    }
    catch (err) {
        const { status, body } = (0, error_1.toErrorResponse)(err);
        res.status(status).json(body);
    }
});
// ---------------------------------------------------------------------------
// POST /api/teachers
// Register a new teacher
// ---------------------------------------------------------------------------
router.post("/", (0, requireRole_1.requireRole)("ADMIN"), async (req, res) => {
    try {
        (0, validators_1.requireFields)(req.body, [
            "firstName", "lastName", "phone", "dob",
            "dateOfJoining", "gender", "information",
        ]);
        const teacher = await Teacher_model_1.TeacherModel.create(req.body);
        res.status(201).json((0, teacher_mapper_1.mapTeacher)(teacher.toObject()));
    }
    catch (err) {
        const { status, body } = (0, error_1.toErrorResponse)(err);
        res.status(status).json(body);
    }
});
// ---------------------------------------------------------------------------
// PATCH /api/teachers/:id/status
// Update employment status
// Fix 8: status is validated against the CurrentStatus enum before DB write
// ---------------------------------------------------------------------------
router.patch("/:id/status", (0, requireRole_1.requireRole)("ADMIN"), async (req, res) => {
    try {
        const status = (0, validators_1.validateTeacherStatus)(req.body.status);
        const teacher = await Teacher_model_1.TeacherModel.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true }).lean();
        if (!teacher)
            throw new error_1.NotFoundError("Teacher", req.params.id);
        res.json((0, teacher_mapper_1.mapTeacher)(teacher));
    }
    catch (err) {
        const { status, body } = (0, error_1.toErrorResponse)(err);
        res.status(status).json(body);
    }
});
// NOTE: PATCH /teachers/:id/assignment has been intentionally removed.
// Teacher-to-section assignment is performed via PATCH /sections/:id/teacher
// as defined in the API specification (backend-API-derivation.md §7).
exports.default = router;
//# sourceMappingURL=teachers.routes.js.map