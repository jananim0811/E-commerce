
import mongoose from "mongoose";
import app from "../server.js";

export default async function handler(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI);
    }

    return app(req, res);
  } catch (error) {
    console.error("Backend error:", error.message);

    return res.status(500).json({
      message: "Database connection failed",
    });
  }
}
