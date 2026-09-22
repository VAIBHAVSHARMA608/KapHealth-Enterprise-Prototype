const mongoose = require("mongoose");
const app = require("../src/app");
const corsOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  process.env.ADMIN_CLIENT_URL || "http://localhost:5174",
];

let connectionPromise;

async function connectDatabase() {
  if (mongoose.connection.readyState === 1) return;
  if (!connectionPromise) {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not configured");
    connectionPromise = mongoose.connect(process.env.MONGO_URI).catch((error) => {
      connectionPromise = undefined;
      throw error;
    });
  }
  await connectionPromise;
}

module.exports = async function handler(req, res) {
  const requestOrigin = req.headers.origin;
  if (corsOrigins.includes(requestOrigin)) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  }

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-admin-key");
    return res.status(204).end();
  }

  try {
    await connectDatabase();
    return app(req, res);
  } catch (error) {
    console.error("[api] request failed:", error.message);
    return res.status(503).json({ message: "Service temporarily unavailable" });
  }
};
