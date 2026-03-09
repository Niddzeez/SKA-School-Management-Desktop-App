"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Class_model_1 = require("../models/Class.model");
const class_mapper_1 = require("../models/class.mapper");
const error_1 = require("../../shared/error");
const validators_1 = require("../../shared/validators");
const requireRole_1 = require("../../auth/middleware/requireRole");
const router = (0, express_1.Router)();
// ---------------------------------------------------------------------------
// GET /api/classes
// List all classes
// ---------------------------------------------------------------------------
router.get("/", async (_req, res) => {
    try {
        const classes = await Class_model_1.ClassModel.find().lean();
        res.json(classes.map(class_mapper_1.mapClass));
    }
    catch (err) {
        const { status, body } = (0, error_1.toErrorResponse)(err);
        res.status(status).json(body);
    }
});
// ---------------------------------------------------------------------------
// POST /api/classes
// Create a new class
// Returns 409 if the ClassName already exists (unique index on ClassModel)
// ---------------------------------------------------------------------------
router.post("/", (0, requireRole_1.requireRole)("ADMIN"), async (req, res) => {
    try {
        (0, validators_1.requireFields)(req.body, ["ClassName"]);
        const cls = await Class_model_1.ClassModel.create({ ClassName: req.body.ClassName });
        res.status(201).json((0, class_mapper_1.mapClass)(cls.toObject()));
    }
    catch (err) {
        // Mongoose duplicate key error code
        if (err.code === 11000) {
            const { status, body } = (0, error_1.toErrorResponse)(new error_1.ConflictError(`Class '${req.body.ClassName}' already exists`));
            return res.status(status).json(body);
        }
        const { status, body } = (0, error_1.toErrorResponse)(err);
        res.status(status).json(body);
    }
});
exports.default = router;
//# sourceMappingURL=classes.routes.js.map