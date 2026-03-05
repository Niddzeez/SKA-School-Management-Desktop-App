"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Section_model_1 = require("../models/Section.model");
const section_mapper_1 = require("../models/section.mapper");
const router = (0, express_1.Router)();
// CREATE section
router.post("/", async (req, res) => {
    const { classID, name, classTeacherID } = req.body;
    if (!classID || !name) {
        return res
            .status(400)
            .json({ error: "classID and name required" });
    }
    try {
        const section = await Section_model_1.SectionModel.create({
            classID,
            name,
            classTeacherID,
        });
        res.status(201).json((0, section_mapper_1.mapSection)(section.toObject()));
    }
    catch (err) {
        res.status(400).json({ error: "Section already exists for this class" });
    }
});
// LIST sections (optionally filtered by classID)
router.get("/", async (req, res) => {
    const { classID } = req.query;
    const filter = classID ? { classID } : {};
    const sections = await Section_model_1.SectionModel.find(filter).lean();
    res.json(sections.map(section_mapper_1.mapSection));
});
// ASSIGN CLASS TEACHER
router.patch("/:id/teacher", async (req, res) => {
    if (!req.body) {
        return res.status(400).json({ error: "Request body missing" });
    }
    const { classTeacherID } = req.body;
    if (!classTeacherID) {
        return res
            .status(400)
            .json({ error: "classTeacherID required" });
    }
    const section = await Section_model_1.SectionModel.findByIdAndUpdate(req.params.id, { classTeacherID }, { new: true }).lean();
    if (!section) {
        return res.status(404).json({ error: "Section not found" });
    }
    res.json((0, section_mapper_1.mapSection)(section));
});
exports.default = router;
//# sourceMappingURL=sections.routes.js.map