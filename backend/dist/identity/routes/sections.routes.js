"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Section_model_1 = require("../models/Section.model");
const section_mapper_1 = require("../models/section.mapper");
const error_1 = require("../../shared/error");
const validators_1 = require("../../shared/validators");
const requireRole_1 = require("../../auth/middleware/requireRole");
const router = (0, express_1.Router)();
// ---------------------------------------------------------------------------
// GET /api/sections
// List all sections (optionally filtered by classID query param)
// ---------------------------------------------------------------------------
router.get("/", async (req, res) => {
    try {
        const filter = req.query.classID ? { classID: req.query.classID } : {};
        const sections = await Section_model_1.SectionModel.find(filter).lean();
        res.json(sections.map(section_mapper_1.mapSection));
    }
    catch (err) {
        const { status, body } = (0, error_1.toErrorResponse)(err);
        res.status(status).json(body);
    }
});
// ---------------------------------------------------------------------------
// POST /api/sections
// Create a new section within a class
// Returns 409 if the section name already exists in that class
// ---------------------------------------------------------------------------
router.post("/", (0, requireRole_1.requireRole)("ADMIN"), async (req, res) => {
    try {
        (0, validators_1.requireFields)(req.body, ["classID", "name"]);
        const section = await Section_model_1.SectionModel.create({
            classID: req.body.classID,
            name: req.body.name,
            classTeacherID: req.body.classTeacherID,
        });
        res.status(201).json((0, section_mapper_1.mapSection)(section.toObject()));
    }
    catch (err) {
        if (err.code === 11000) {
            const { status, body } = (0, error_1.toErrorResponse)(new error_1.ConflictError(`Section '${req.body.name}' already exists in this class`));
            return res.status(status).json(body);
        }
        const { status, body } = (0, error_1.toErrorResponse)(err);
        res.status(status).json(body);
    }
});
// ---------------------------------------------------------------------------
// PATCH /api/sections/:id/teacher
// Assign a class teacher to a section
//
// Note: The live frontend SectionContext calls this endpoint as /teacher
// (not /assign-teacher as the spec document states). Both the frontend and
// backend currently use /teacher. The route is kept consistent with the
// frontend's actual HTTP call to avoid a breaking change.
// This should be aligned to /assign-teacher when the frontend is updated.
// ---------------------------------------------------------------------------
router.patch("/:id/teacher", (0, requireRole_1.requireRole)("ADMIN"), async (req, res) => {
    try {
        (0, validators_1.requireFields)(req.body, ["classTeacherID"]);
        const section = await Section_model_1.SectionModel.findByIdAndUpdate(req.params.id, { classTeacherID: req.body.classTeacherID }, { new: true, runValidators: true }).lean();
        if (!section)
            throw new error_1.NotFoundError("Section", req.params.id);
        res.json((0, section_mapper_1.mapSection)(section));
    }
    catch (err) {
        const { status, body } = (0, error_1.toErrorResponse)(err);
        res.status(status).json(body);
    }
});
exports.default = router;
//# sourceMappingURL=sections.routes.js.map