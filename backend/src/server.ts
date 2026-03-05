import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectMongo } from "./config/mongo";
import { connectPostgres } from "./config/postgres";

const PORT = process.env.PORT || 4000;

const startServer = async (): Promise<void> => {
  // Both database subsystems must be ready before the server accepts traffic.
  // MongoDB  → Identity & Academic data
  // PostgreSQL → Finance & Audit data
  await connectMongo();
  await connectPostgres();

  app.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});