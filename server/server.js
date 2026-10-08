import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./config/db.js";

import authRoutes from "./routes/auth.js";
import memberRoutes from "./routes/members.js";
import eventRoutes from "./routes/events.js";
import newsRoutes from "./routes/news.js";
import researchRoutes from "./routes/research.js";
import contactRoutes from "./routes/contact.js";
import uploadRoutes from "./routes/uploads.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------------------------------------
// SECURITY
// --------------------------------------------------

app.use(helmet());

// --------------------------------------------------
// CORS
// --------------------------------------------------

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://samuel-presently-congress-compliance.trycloudflare.com"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

// --------------------------------------------------
// BODY PARSING
// --------------------------------------------------

app.use(express.json({ limit: "10mb" }));

// --------------------------------------------------
// STATIC UPLOADS
// --------------------------------------------------

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// --------------------------------------------------
// ROOT
// --------------------------------------------------

app.get("/", (req, res) => {
  res.json({
    message: "GAPS API is running",
    organization: "Ghana Association of Paediatric Surgeons"
  });
});

// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      status: "OK",
      message: "GAPS backend and PostgreSQL are connected",
      databaseTime: result.rows[0].now
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      status: "ERROR",
      message: "Backend is running but PostgreSQL connection failed"
    });
  }
});

// --------------------------------------------------
// API ROUTES
// --------------------------------------------------

app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/research", researchRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/uploads", uploadRoutes);

// --------------------------------------------------
// 404
// --------------------------------------------------

app.use((req, res) => {
  res.status(404).json({
    message: "API endpoint not found"
  });
});

// --------------------------------------------------
// ERROR HANDLER
// --------------------------------------------------

app.use((error, req, res, next) => {
  console.error("Server error:", error);

  if (error?.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      message: "Image is too large. Maximum allowed size is 5MB."
    });
  }

  if (error?.message?.includes("Only JPG")) {
    return res.status(400).json({
      message: error.message
    });
  }

  res.status(500).json({
    message: "Internal server error"
  });
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

app.listen(PORT, () => {
  console.log(`GAPS server running on http://localhost:${PORT}`);
});