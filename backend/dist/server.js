"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const mongo_1 = require("./config/mongo");
const postgres_1 = require("./config/postgres");
const PORT = process.env.PORT || 4000;
const startServer = async () => {
    // Both database subsystems must be ready before the server accepts traffic.
    // MongoDB  → Identity & Academic data
    // PostgreSQL → Finance & Audit data
    await (0, mongo_1.connectMongo)();
    await (0, postgres_1.connectPostgres)();
    app_1.default.listen(PORT, () => {
        console.log(`🚀 Backend running on port ${PORT}`);
    });
};
startServer().catch((err) => {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map