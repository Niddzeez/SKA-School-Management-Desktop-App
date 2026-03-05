"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Teacher_model_1 = require("../models/Teacher.model");
const teacher_mapper_1 = require("../models/teacher.mapper");
const router = (0, express_1.Router)();
// CREATE teacher
router.post("/", async (req, res) => {
    if (!req.body) {
        return res.status(400).json({ error: "Request body missing" });
    }
    try {
        const teacher = await Teacher_model_1.TeacherModel.create(req.body);
        res.status(201).json((0, teacher_mapper_1.mapTeacher)(teacher.toObject()));
    }
    catch (err) {
        res.status(400).json({ error: "Invalid teacher data" });
    }
});
// LIST teachers
router.get("/", async (_req, res) => {
    const teachers = await Teacher_model_1.TeacherModel.find().lean();
    res.json(teachers.map(teacher_mapper_1.mapTeacher));
});
// GET teacher by ID
router.get("/:id", async (req, res) => {
    const teacher = await Teacher_model_1.TeacherModel.findById(req.params.id).lean();
    if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
    }
    res.json((0, teacher_mapper_1.mapTeacher)(teacher));
});
// UPDATE status
router.patch("/:id/status", async (req, res) => {
    if (!req.body) {
        return res.status(400).json({ error: "Request body missing" });
    }
    const { status } = req.body;
    if (!status) {
        return res.status(400).json({ error: "status required" });
    }
    const teacher = await Teacher_model_1.TeacherModel.findByIdAndUpdate(req.params.id, { status }, { new: true }).lean();
    if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
    }
    res.json((0, teacher_mapper_1.mapTeacher)(teacher));
});
// ASSIGN current class
router.patch("/:id/assignment", async (req, res) => {
    if (!req.body) {
        return res.status(400).json({ error: "Request body missing" });
    }
    const { className, section } = req.body;
    if (!className || !section) {
        return res
            .status(400)
            .json({ error: "className and section required" });
    }
    const teacher = await Teacher_model_1.TeacherModel.findByIdAndUpdate(req.params.id, {
        currentClass: { className, section },
    }, { new: true }).lean();
    if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
    }
    res.json((0, teacher_mapper_1.mapTeacher)(teacher));
});
exports.default = router;
//# sourceMappingURL=teachers.routes.js.map