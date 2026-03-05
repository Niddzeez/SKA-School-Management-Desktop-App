import { Router, Request, Response } from "express";
import { SectionModel } from "../models/Section.model";
import { mapSection } from "../models/section.mapper";
import { toErrorResponse, NotFoundError, ConflictError } from "../../shared/error";
import { requireFields } from "../../shared/validators";

const router = Router();

// ---------------------------------------------------------------------------
// GET /api/sections
// List all sections (optionally filtered by classID query param)
// ---------------------------------------------------------------------------
router.get("/", async (req: Request, res: Response) => {
  try {
    const filter = req.query.classID ? { classID: req.query.classID } : {};
    const sections = await SectionModel.find(filter).lean();
    res.json(sections.map(mapSection));
  } catch (err) {
    const { status, body } = toErrorResponse(err);
    res.status(status).json(body);
  }
});

// ---------------------------------------------------------------------------
// POST /api/sections
// Create a new section within a class
// Returns 409 if the section name already exists in that class
// ---------------------------------------------------------------------------
router.post("/", async (req: Request, res: Response) => {
  try {
    requireFields(req.body, ["classID", "name"]);

    const section = await SectionModel.create({
      classID: req.body.classID,
      name: req.body.name,
      classTeacherID: req.body.classTeacherID,
    });

    res.status(201).json(mapSection(section.toObject()));
  } catch (err: any) {
    if (err.code === 11000) {
      const { status, body } = toErrorResponse(
        new ConflictError(
          `Section '${req.body.name}' already exists in this class`
        )
      );
      return res.status(status).json(body);
    }
    const { status, body } = toErrorResponse(err);
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
router.patch("/:id/teacher", async (req: Request, res: Response) => {
  try {
    requireFields(req.body, ["classTeacherID"]);

    const section = await SectionModel.findByIdAndUpdate(
      req.params.id,
      { classTeacherID: req.body.classTeacherID },
      { new: true, runValidators: true }
    ).lean();

    if (!section) throw new NotFoundError("Section", req.params.id);
    res.json(mapSection(section));
  } catch (err) {
    const { status, body } = toErrorResponse(err);
    res.status(status).json(body);
  }
});

export default router;