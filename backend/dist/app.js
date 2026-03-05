"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const students_routes_1 = __importDefault(require("./identity/routes/students.routes"));
const classes_routes_1 = __importDefault(require("./identity/routes/classes.routes"));
const sections_routes_1 = __importDefault(require("./identity/routes/sections.routes"));
const teachers_routes_1 = __importDefault(require("./identity/routes/teachers.routes"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "http://localhost:5173", // Vite dev server
    credentials: true,
}));
app.use(express_1.default.json());
app.use((req, _res, next) => {
    console.log("🔥 Incoming:", req.method, req.url);
    next();
});
// routes
app.use("/api/students", students_routes_1.default);
app.use("/api/classes", classes_routes_1.default);
app.use("/api/sections", sections_routes_1.default);
app.use("/api/teachers", teachers_routes_1.default);
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
exports.default = app;
//# sourceMappingURL=app.js.map