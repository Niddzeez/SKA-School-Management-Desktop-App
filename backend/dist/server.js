"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const db_1 = require("./identity/db");
const PORT = process.env.PORT || 4000;
const startServer = async () => {
    await (0, db_1.connectMongo)();
    app_1.default.listen(PORT, () => {
        console.log(`Backend running on port ${PORT}`);
    });
};
startServer();
//# sourceMappingURL=server.js.map