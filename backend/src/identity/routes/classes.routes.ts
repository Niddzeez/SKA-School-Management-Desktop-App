import { Router, Request, Response } from "express";
import { ClassModel } from "../models/Class.model";
import { mapClass } from "../models/class.mapper";
import { toErrorResponse, ConflictError } from "../../shared/error";
import { requireFields } from "../../shared/validators";

const router = Router();

// ---------------------------------------------------------------------------
// GET /api/classes
// List all classes
// ---------------------------------------------------------------------------
router.get("/", async (_req: Request, res: Response) => {
  try {
    const classes = await ClassModel.find().lean();
    res.json(classes.map(mapClass));
  } catch (err) {
    const { status, body } = toErrorResponse(err);
    res.status(status).json(body);
  }
});

// ---------------------------------------------------------------------------
// POST /api/classes
// Create a new class
// Returns 409 if the ClassName already exists (unique index on ClassModel)
// ---------------------------------------------------------------------------
router.post("/", async (req: Request, res: Response) => {
  try {
    requireFields(req.body, ["ClassName"]);

    const cls = await ClassModel.create({ ClassName: req.body.ClassName });
    res.status(201).json(mapClass(cls.toObject()));
  } catch (err: any) {
    // Mongoose duplicate key error code
    if (err.code === 11000) {
      const { status, body } = toErrorResponse(
        new ConflictError(`Class '${req.body.ClassName}' already exists`)
      );
      return res.status(status).json(body);
    }
    const { status, body } = toErrorResponse(err);
    res.status(status).json(body);
  }
});

export default router;