"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Student_model_1 = require("../models/Student.model");
const student_mapper_1 = require("../models/student.mapper");
const error_1 = require("../../shared/error");
const validators_1 = require("../../shared/validators");
const requireRole_1 = require("../../auth/middleware/requireRole");
const router = (0, express_1.Router)();
// ---------------------------------------------------------------------------
// GET /api/students
// List all students
// ---------------------------------------------------------------------------
router.get("/", async (_req, res) => {
    try {
        const students = await Student_model_1.Student.find().lean();
        res.json(students.map(student_mapper_1.mapStudent));
    }
    catch (err) {
        const { status, body } = (0, error_1.toErrorResponse)(err);
        res.status(status).json(body);
    }
});
// ---------------------------------------------------------------------------
// GET /api/students/:id
// Get a single student by ID
// Fix 6: duplicate route removed — this is the single, safe version
// ---------------------------------------------------------------------------
router.get("/:id", async (req, res) => {
    try {
        const student = await Student_model_1.Student.findById(req.params.id).lean();
        if (!student)
            throw new error_1.NotFoundError("Student", req.params.id);
        res.json((0, student_mapper_1.mapStudent)(student));
    }
    catch (err) {
        const { status, body } = (0, error_1.toErrorResponse)(err);
        res.status(status).json(body);
    }
});
// ---------------------------------------------------------------------------
// POST /api/students
// Admit a new student
// ---------------------------------------------------------------------------
router.post("/", (0, requireRole_1.requireRole)("ADMIN"), async (req, res) => {
    try {
        (0, validators_1.requireFields)(req.body, ["firstName", "lastName", "gender", "dateOfBirth", "phoneNumber", "nationality"]);
        const student = await Student_model_1.Student.create(req.body);
        res.status(201).json((0, student_mapper_1.mapStudent)(student.toObject()));
    }
    catch (err) {
        const { status, body } = (0, error_1.toErrorResponse)(err);
        res.status(status).json(body);
    }
});
// ---------------------------------------------------------------------------
// PATCH /api/students/:id/status
// Update enrollment status
// Fix 8: status is validated against the StudentStatus enum before DB write
// ---------------------------------------------------------------------------
router.patch("/:id/status", (0, requireRole_1.requireRole)("ADMIN"), async (req, res) => {
    try {
        const status = (0, validators_1.validateStudentStatus)(req.body.status);
        const student = await Student_model_1.Student.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true }).lean();
        if (!student)
            throw new error_1.NotFoundError("Student", req.params.id);
        res.json((0, student_mapper_1.mapStudent)(student));
    }
    catch (err) {
        const { status, body } = (0, error_1.toErrorResponse)(err);
        res.status(status).json(body);
    }
});
// ---------------------------------------------------------------------------
// PATCH /api/students/:id/assignment
// Assign student to a class and section
// ---------------------------------------------------------------------------
router.patch("/:id/assignment", (0, requireRole_1.requireRole)("ADMIN"), async (req, res) => {
    try {
        (0, validators_1.requireFields)(req.body, ["classID", "sectionID"]);
        const { classID, sectionID } = req.body;
        const student = await Student_model_1.Student.findByIdAndUpdate(req.params.id, { classID, sectionID }, { new: true, runValidators: true }).lean();
        if (!student)
            throw new error_1.NotFoundError("Student", req.params.id);
        res.json((0, student_mapper_1.mapStudent)(student));
    }
    catch (err) {
        const { status, body } = (0, error_1.toErrorResponse)(err);
        res.status(status).json(body);
    }
});
// ---------------------------------------------------------------------------
// PATCH /api/students/:id
// Generic partial update — supports profile edits from StudentContext.updateStudent()
// Fix 7: this endpoint was missing, causing StudentContext.updateStudent() to fail silently
//
// Security note: classID/sectionID changes must go through /assignment
// and status changes must go through /status to preserve explicit command semantics.
// This route guards against those fields being set via generic update.
// ---------------------------------------------------------------------------
router.patch("/:id", (0, requireRole_1.requireRole)("ADMIN"), async (req, res) => {
    try {
        // Protect command-specific fields from being set via the generic update path
        const { status, classID, sectionID, ...safeUpdates } = req.body;
        if (status !== undefined || classID !== undefined || sectionID !== undefined) {
            throw new error_1.ValidationError("Use /status for status changes and /assignment for class/section changes");
        }
        if (Object.keys(safeUpdates).length === 0) {
            throw new error_1.ValidationError("No updatable fields provided");
        }
        const student = await Student_model_1.Student.findByIdAndUpdate(req.params.id, safeUpdates, { new: true, runValidators: true }).lean();
        if (!student)
            throw new error_1.NotFoundError("Student", req.params.id);
        res.json((0, student_mapper_1.mapStudent)(student));
    }
    catch (err) {
        const { status, body } = (0, error_1.toErrorResponse)(err);
        res.status(status).json(body);
    }
});
exports.default = router;
//# sourceMappingURL=students.routes.js.map