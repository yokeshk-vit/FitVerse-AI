
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");

// Import API routes
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const workoutRoutes = require("./routes/workoutRoutes");
const adaptiveProgressRoutes = require("./routes/adaptiveProgressRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/*
========================================
SECURITY MIDDLEWARE
========================================
*/

app.use(helmet());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
  "https://fit-verse-ai.vercel.app",
  "https://fit-verse-ai-git-main-yokeshk-vit.vercel.app"
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("CORS origin not allowed")
      );
    }
  })
);

app.use(express.json({ limit: "100kb" }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false
});

app.use("/api", apiLimiter);

/*
========================================
BASIC ROUTES
========================================
*/

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to FitVerse AI Backend",
    version: "1.0.0"
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "running",
    service: "FitVerse AI API",
    database: "connected",
    timestamp: new Date().toISOString()
  });
});

/*
========================================
FITVERSE AI API ROUTES
========================================
*/

// Authentication
app.use("/api/auth", authRoutes);

// Student profile
app.use("/api/profile", profileRoutes);

// Workout history and progress
app.use("/api/workouts", workoutRoutes);

// Adaptive training levels and feedback
app.use(
  "/api/adaptive-progress",
  adaptiveProgressRoutes
);

/*
========================================
404 HANDLER
========================================
*/

app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found"
  });
});

/*
========================================
ERROR HANDLER
========================================
*/

app.use((err, req, res, next) => {
  console.error("Backend error:", err.name);

  if (
    err.message === "CORS origin not allowed"
  ) {
    return res.status(403).json({
      success: false,
      message: "Origin not allowed"
    });
  }

  if (
    err instanceof SyntaxError &&
    err.status === 400
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body"
    });
  }

  return res.status(500).json({
    success: false,
    message: "An internal server error occurred"
  });
});

/*
========================================
START SERVER
========================================
*/

async function startServer() {
  try {
    console.log("");
    console.log("Starting FitVerse AI Backend...");

    await connectDB();

    if (
      !process.env.JWT_SECRET ||
      process.env.JWT_SECRET.length < 32
    ) {
      throw new Error(
        "JWT_SECRET must contain at least 32 characters"
      );
    }

    app.listen(PORT, () => {
      console.log("");
      console.log("=================================");
      console.log("       FITVERSE AI BACKEND       ");
      console.log("=================================");
      console.log(`Server running on port ${PORT}`);
      console.log(`Local URL: http://localhost:${PORT}`);

      console.log(
        `Health: http://localhost:${PORT}/api/health`
      );

      console.log("MongoDB Atlas: Connected");
      console.log("Authentication routes: Enabled");
      console.log("Student profile routes: Enabled");
      console.log("Workout history routes: Enabled");
      console.log("Adaptive progress routes: Enabled");
      console.log("Frontend port 5175: Allowed");
      console.log("=================================");
      console.log("");
    });

  } catch (error) {
    console.error("");
    console.error(
      "FitVerse AI backend could not start."
    );
    console.error(
      "Check MongoDB Atlas and JWT configuration."
    );
    process.exit(1);
  }
}

startServer();

