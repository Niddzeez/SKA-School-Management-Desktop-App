import { Router } from "express";
import { SectionModel } from "../models/Section.model";
import { mapSection } from "../models/section.mapper";

const router = Router();

// CREATE section
router.post("/", async (req, res) => {
  const { classID, name, classTeacherID } = req.body;

  if (!classID || !name) {
    return res
      .status(400)
      .json({ error: "classID and name required" });
  }

  try {
    const section = await SectionModel.create({
      classID,
      name,
      classTeacherID,
    });

    res.status(201).json(mapSection(section.toObject()));
  } catch (err) {
    res.status(400).json({ error: "Section already exists for this class" });
  }
});

// LIST sections (optionally filtered by classID)
router.get("/", async (req, res) => {
  const { classID } = req.query;

  const filter = classID ? { classID } : {};
  const sections = await SectionModel.find(filter).lean();

  res.json(sections.map(mapSection));
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

  const section = await SectionModel.findByIdAndUpdate(
    req.params.id,
    { classTeacherID },
    { new: true }
  ).lean();

  if (!section) {
    return res.status(404).json({ error: "Section not found" });
  }

  res.json(mapSection(section));
});


export default router;
