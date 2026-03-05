import express from "express";
import studentRoutes from "./identity/routes/students.routes";
import classRoutes from "./identity/routes/classes.routes";
import sectionRoutes from "./identity/routes/sections.routes";
import teacherRoutes from "./identity/routes/teachers.routes"


import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // Vite dev server
    credentials: true,
  })
);

app.use(express.json());

app.use((req, _res, next) => {
  console.log("🔥 Incoming:", req.method, req.url);
  next();
});

// routes
app.use("/api/students", studentRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/teachers", teacherRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

export default app;

