require("dns").setDefaultResultOrder("ipv4first");

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/database");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORS with specific origins for production
app.use(
  cors({
    origin: [
      "https://dhishan-frontend.vercel.app",
      "https://dhishan-backend.onrender.com/",
      "http://localhost:5173",
      "http://localhost:3000",

      /\.vercel\.app$/, // Allow all Vercel deployments
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Health check endpoint (important for Render)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "Dhishan API",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Basic route
app.get("/", (req, res) => {
  res.json({
    message: "Dhishan 26 API",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

// Route files
const authRoutes = require("./routes/authRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Mount routers
app.use("/api/auth", authRoutes);
app.use("/api/registration", registrationRoutes);
app.use("/api/admin", adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
});
