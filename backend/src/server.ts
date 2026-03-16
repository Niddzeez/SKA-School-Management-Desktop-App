import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectMongo } from "./config/mongo";
import { connectPostgres } from "./config/postgres";

const PORT = process.env.PORT || 4000;

let server: any;


process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Promise Rejection:", reason);
  shutdown();
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  shutdown();
});



const shutdown = () => {
  console.log("⚠️ Shutting down server...");

  if (server) {
    server.close(() => {
      console.log("🛑 HTTP server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};


const startServer = async (): Promise<void> => {
  // MongoDB → Identity subsystem
  await connectMongo();

  // PostgreSQL → Finance subsystem
  await connectPostgres();

  server = app.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});