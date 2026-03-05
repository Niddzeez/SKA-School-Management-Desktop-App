"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Student_model_1 = require("../models/Student.model");
const student_mapper_1 = require("../models/student.mapper");
const router = (0, express_1.Router)();
// CREATE
router.post("/", async (req, res) => {
    try {
        const student = await Student_model_1.Student.create(req.body);
        res.status(201).json((0, student_mapper_1.mapStudent)(student.toObject()));
    }
    catch (err) {
        res.status(400).json({ error: "Invalid student data" });
    }
});
// LIST
router.get("/", async (_req, res) => {
    const students = await Student_model_1.Student.find().lean();
    res.json(students.map(student_mapper_1.mapStudent));
});
// GET BY ID
router.get("/:id", async (req, res) => {
    const student = await Student_model_1.Student.findById(req.params.id).lean();
    if (!student) {
        return res.status(404).json({ error: "Student not found" });
    }
    res.json((0, student_mapper_1.mapStudent)(student));
});
// UPDATE STATUS
router.patch("/:id/status", async (req, res) => {
    const { status } = req.body;
    const student = await Student_model_1.Student.findByIdAndUpdate(req.params.id, { status }, { new: true }).lean();
    if (!student) {
        return res.status(404).json({ error: "Student not found" });
    }
    res.json((0, student_mapper_1.mapStudent)(student));
});
// UPDATE ASSIGNMENT
router.patch("/:id/assignment", async (req, res) => {
    const { classID, sectionID } = req.body;
    if (!classID || !sectionID) {
        return res
            .status(400)
            .json({ error: "classID and sectionID required" });
    }
    const student = await Student_model_1.Student.findByIdAndUpdate(req.params.id, { classID, sectionID }, { new: true }).lean();
    if (!student) {
        return res.status(404).json({ error: "Student not found" });
    }
    res.json((0, student_mapper_1.mapStudent)(student));
});
exports.default = router;
//# sourceMappingURL=students.routes.js.map