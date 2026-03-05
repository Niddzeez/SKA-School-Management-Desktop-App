import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectMongo } from "./identity/db";

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  await connectMongo();

  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
};

startServer();
