import { Router, Request, Response } from "express";
import { TeacherModel } from "../models/Teacher.model";
import { mapTeacher } from "../models/teacher.mapper";
import { toErrorResponse, NotFoundError } from "../../shared/error";
import { validateTeacherStatus, requireFields } from "../../shared/validators";
import { requireRole } from "../../auth/middleware/requireRole";

const router = Router();

// ---------------------------------------------------------------------------
// GET /api/teachers
// List all teachers
// ---------------------------------------------------------------------------
router.get("/", async (_req: Request, res: Response) => {
  try {
    const teachers = await TeacherModel.find().lean();
    res.json(teachers.map(mapTeacher));
  } catch (err) {
    const { status, body } = toErrorResponse(err);
    res.status(status).json(body);
  }
});

// ---------------------------------------------------------------------------
// GET /api/teachers/:id
// Get a single teacher by ID
// ---------------------------------------------------------------------------
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const teacher = await TeacherModel.findById(req.params.id).lean();
    if (!teacher) throw new NotFoundError("Teacher", req.params.id);
    res.json(mapTeacher(teacher));
  } catch (err) {
    const { status, body } = toErrorResponse(err);
    res.status(status).json(body);
  }
});

// ---------------------------------------------------------------------------
// POST /api/teachers
// Register a new teacher
// ---------------------------------------------------------------------------
router.post("/", requireRole("ADMIN"), async (req: Request, res: Response) => {
  try {
    requireFields(req.body, [
      "firstName", "lastName", "phone", "dob",
      "dateOfJoining", "gender", "information",
    ]);
    const teacher = await TeacherModel.create(req.body);
    res.status(201).json(mapTeacher(teacher.toObject()));
  } catch (err) {
    const { status, body } = toErrorResponse(err);
    res.status(status).json(body);
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/teachers/:id/status
// Update employment status
// Fix 8: status is validated against the CurrentStatus enum before DB write
// ---------------------------------------------------------------------------
router.patch("/:id/status", requireRole("ADMIN"), async (req: Request, res: Response) => {
  try {
    const status = validateTeacherStatus(req.body.status);

    const teacher = await TeacherModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).lean();

    if (!teacher) throw new NotFoundError("Teacher", req.params.id);
    res.json(mapTeacher(teacher));
  } catch (err) {
    const { status, body } = toErrorResponse(err);
    res.status(status).json(body);
  }
});

// NOTE: PATCH /teachers/:id/assignment has been intentionally removed.
// Teacher-to-section assignment is performed via PATCH /sections/:id/teacher
// as defined in the API specification (backend-API-derivation.md §7).

export default router;