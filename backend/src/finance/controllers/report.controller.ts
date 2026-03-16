import { Request, Response } from "express";
import { getYearEndStatementFast } from "../services/report.service";
import { normalizeAcademicYear } from "../../shared/report-params";

export async function yearEndReportHandler(req: Request, res: Response) {
    try {
        const year = normalizeAcademicYear(req.query.year as string);

        if (!year) {
            return res.status(400).json({ message: "year query required" });
        }

        const data = await getYearEndStatementFast(year);
        res.json(data);

    } catch (err) {
        res.status(500).json({ message: "Failed to generate report" });
    }
}