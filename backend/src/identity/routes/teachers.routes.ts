import { Router } from "express";
import { TeacherModel } from "../models/Teacher.model";
import { mapTeacher } from "../models/teacher.mapper";

const router = Router();

// CREATE teacher
router.post("/", async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: "Request body missing" });
  }

  try {
    const teacher = await TeacherModel.create(req.body);
    res.status(201).json(mapTeacher(teacher.toObject()));
  } catch (err) {
    res.status(400).json({ error: "Invalid teacher data" });
  }
});

// LIST teachers
router.get("/", async (_req, res) => {
  const teachers = await TeacherModel.find().lean();
  res.json(teachers.map(mapTeacher));
});

// GET teacher by ID
router.get("/:id", async (req, res) => {
  const teacher = await TeacherModel.findById(req.params.id).lean();

  if (!teacher) {
    return res.status(404).json({ error: "Teacher not found" });
  }

  res.json(mapTeacher(teacher));
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

  const teacher = await TeacherModel.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).lean();

  if (!teacher) {
    return res.status(404).json({ error: "Teacher not found" });
  }

  res.json(mapTeacher(teacher));
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

  const teacher = await TeacherModel.findByIdAndUpdate(
    req.params.id,
    {
      currentClass: { className, section },
    },
    { new: true }
  ).lean();

  if (!teacher) {
    return res.status(404).json({ error: "Teacher not found" });
  }

  res.json(mapTeacher(teacher));
});

export default router;
