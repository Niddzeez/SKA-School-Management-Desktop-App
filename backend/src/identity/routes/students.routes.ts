import { Router } from "express";
import { Student } from "../models/Student.model";
import { mapStudent } from "../models/student.mapper";

const router = Router();

// CREATE
router.post("/", async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(mapStudent(student.toObject()));
  } catch (err) {
    res.status(400).json({ error: "Invalid student data" });
  }
});

// LIST
router.get("/", async (_req, res) => {
  const students = await Student.find().lean();
  res.json(students.map(mapStudent));
});

// GET BY ID
router.get("/:id", async (req, res) => {
  const student = await Student.findById(req.params.id).lean();

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  res.json(mapStudent(student));
});

// UPDATE STATUS
router.patch("/:id/status", async (req, res) => {
  const { status } = req.body;

  const student = await Student.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).lean();

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  res.json(mapStudent(student));
});

// UPDATE ASSIGNMENT
router.patch("/:id/assignment", async (req, res) => {
  const { classID, sectionID } = req.body;

  if (!classID || !sectionID) {
    return res
      .status(400)
      .json({ error: "classID and sectionID required" });
  }

  const student = await Student.findByIdAndUpdate(
    req.params.id,
    { classID, sectionID },
    { new: true }
  ).lean();

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  res.json(mapStudent(student));
});

// GET student by ID
router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).lean();

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(mapStudent(student));
  } catch (err) {
    res.status(400).json({ error: "Invalid student ID" });
  }
});


export default router;
