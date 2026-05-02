require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Connect to MongoDB
connectDB();

// CORS — allow frontend origin
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "https://team-task-manager.up.railway.app", // update with your Railway URL
];

// Only use CORS for API routes in development
const isDevelopment = process.env.NODE_ENV !== "production";

if (isDevelopment) {
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    }),
  );
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve frontend build in production
if (isDevelopment === false) {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
}

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/dashboard", require("./routes/dashboard"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// SPA fallback route (serve index.html for all non-API routes in production)
if (isDevelopment === false) {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
  });
} else {
  // 404 handler for development
  app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
  });
}

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
  );
});
