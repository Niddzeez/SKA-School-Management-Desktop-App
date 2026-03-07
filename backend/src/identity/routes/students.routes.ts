import { Router, Request, Response } from "express";
import { Student } from "../models/Student.model";
import { mapStudent } from "../models/student.mapper";
import { toErrorResponse, NotFoundError, ValidationError } from "../../shared/error";
import { validateStudentStatus, requireFields } from "../../shared/validators";
import { requireRole } from "../../auth/middleware/requireRole";

const router = Router();

// ---------------------------------------------------------------------------
// GET /api/students
// List all students
// ---------------------------------------------------------------------------
router.get("/", async (_req: Request, res: Response) => {
  try {
    const students = await Student.find().lean();
    res.json(students.map(mapStudent));
  } catch (err) {
    const { status, body } = toErrorResponse(err);
    res.status(status).json(body);
  }
});

// ---------------------------------------------------------------------------
// GET /api/students/:id
// Get a single student by ID
// Fix 6: duplicate route removed — this is the single, safe version
// ---------------------------------------------------------------------------
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const student = await Student.findById(req.params.id).lean();
    if (!student) throw new NotFoundError("Student", req.params.id);
    res.json(mapStudent(student));
  } catch (err) {
    const { status, body } = toErrorResponse(err);
    res.status(status).json(body);
  }
});

// ---------------------------------------------------------------------------
// POST /api/students
// Admit a new student
// ---------------------------------------------------------------------------
router.post("/", requireRole("ADMIN"), async (req: Request, res: Response) => {
  try {
    requireFields(req.body, ["firstName", "lastName", "gender", "dateOfBirth", "phoneNumber", "nationality"]);
    const student = await Student.create(req.body);
    res.status(201).json(mapStudent(student.toObject()));
  } catch (err) {
    const { status, body } = toErrorResponse(err);
    res.status(status).json(body);
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/students/:id/status
// Update enrollment status
// Fix 8: status is validated against the StudentStatus enum before DB write
// ---------------------------------------------------------------------------
router.patch("/:id/status", requireRole("ADMIN"), async (req: Request, res: Response) => {
  try {
    const status = validateStudentStatus(req.body.status);

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).lean();

    if (!student) throw new NotFoundError("Student", req.params.id);
    res.json(mapStudent(student));
  } catch (err) {
    const { status, body } = toErrorResponse(err);
    res.status(status).json(body);
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/students/:id/assignment
// Assign student to a class and section
// ---------------------------------------------------------------------------
router.patch("/:id/assignment", requireRole("ADMIN"), async (req: Request, res: Response) => {
  try {
    requireFields(req.body, ["classID", "sectionID"]);
    const { classID, sectionID } = req.body;

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { classID, sectionID },
      { new: true, runValidators: true }
    ).lean();

    if (!student) throw new NotFoundError("Student", req.params.id);
    res.json(mapStudent(student));
  } catch (err) {
    const { status, body } = toErrorResponse(err);
    res.status(status).json(body);
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/students/:id
// Generic partial update — supports profile edits from StudentContext.updateStudent()
// Fix 7: this endpoint was missing, causing StudentContext.updateStudent() to fail silently
//
// Security note: classID/sectionID changes must go through /assignment
// and status changes must go through /status to preserve explicit command semantics.
// This route guards against those fields being set via generic update.
// ---------------------------------------------------------------------------
router.patch("/:id", requireRole("ADMIN"), async (req: Request, res: Response) => {
  try {
    // Protect command-specific fields from being set via the generic update path
    const { status, classID, sectionID, ...safeUpdates } = req.body;

    if (status !== undefined || classID !== undefined || sectionID !== undefined) {
      throw new ValidationError(
        "Use /status for status changes and /assignment for class/section changes"
      );
    }

    if (Object.keys(safeUpdates).length === 0) {
      throw new ValidationError("No updatable fields provided");
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      safeUpdates,
      { new: true, runValidators: true }
    ).lean();

    if (!student) throw new NotFoundError("Student", req.params.id);
    res.json(mapStudent(student));
  } catch (err) {
    const { status, body } = toErrorResponse(err);
    res.status(status).json(body);
  }
});

export default router;