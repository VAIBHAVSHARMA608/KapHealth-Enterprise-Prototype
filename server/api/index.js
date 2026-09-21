const mongoose = require("mongoose");
const app = require("../src/app");

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
  try {
    await connectDatabase();
    return app(req, res);
  } catch (error) {
    console.error("[api] request failed:", error.message);
    return res.status(500).json({ message: "Service temporarily unavailable" });
  }
};
