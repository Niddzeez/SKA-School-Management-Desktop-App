"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Class_model_1 = require("../models/Class.model");
const class_mapper_1 = require("../models/class.mapper");
const router = (0, express_1.Router)();
// CREATE class
router.post("/", async (req, res) => {
    const { ClassName } = req.body;
    if (!ClassName) {
        return res.status(400).json({ error: "ClassName required" });
    }
    try {
        const cls = await Class_model_1.ClassModel.create({ ClassName });
        res.status(201).json((0, class_mapper_1.mapClass)(cls.toObject()));
    }
    catch (err) {
        res.status(400).json({ error: "Class already exists" });
    }
});
// LIST classes
router.get("/", async (_req, res) => {
    const classes = await Class_model_1.ClassModel.find().lean();
    res.json(classes.map(class_mapper_1.mapClass));
});
exports.default = router;
//# sourceMappingURL=classes.routes.js.map