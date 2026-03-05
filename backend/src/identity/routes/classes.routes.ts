import { Router } from "express";
import { ClassModel } from "../models/Class.model";
import { mapClass } from "../models/class.mapper";

const router = Router();

// CREATE class
router.post("/", async (req, res) => {
  const { ClassName } = req.body;

  if (!ClassName) {
    return res.status(400).json({ error: "ClassName required" });
  }

  try {
    const cls = await ClassModel.create({ ClassName });
    res.status(201).json(mapClass(cls.toObject()));
  } catch (err) {
    res.status(400).json({ error: "Class already exists" });
  }
});

// LIST classes
router.get("/", async (_req, res) => {
  const classes = await ClassModel.find().lean();
  res.json(classes.map(mapClass));
});

export default router;
