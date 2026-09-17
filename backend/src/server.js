// Load environment variables before importing modules
// that create the Prisma client.
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const prisma = require("./config/database");

// Import routes
const parkingRoutes = require("./routes/parkingRoutes");
const customerRoutes = require("./routes/customerRoutes");
const authRoutes = require("./routes/authRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const vipReservationRoutes = require("./routes/vipReservationRoutes");
const staffRoutes = require("./routes/staffRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

// Middleware
const notFoundMiddleware = require("./middleware/notFoundMiddleware");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

const PORT = process.env.PORT || 5000;

const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

const allowedOrigins = new Set([
  FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
]);

// ----------------------------------------------------
// Middleware
// ----------------------------------------------------

app.use(
  cors({
    origin: (origin, callback) => {
      callback(
        null,
        !origin || allowedOrigins.has(origin)
      );
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----------------------------------------------------
// Database health check
// ----------------------------------------------------

app.get("/api/test", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      success: true,
      message:
        "Backend and Neon PostgreSQL connection are working",
    });
  } catch (error) {
    console.error("Database health check failed");

    res.status(503).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// ----------------------------------------------------
// API Routes
// ----------------------------------------------------

app.use("/api", parkingRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/customers", customerRoutes);

app.use(
  "/api/reservations/vip",
  vipReservationRoutes
);

app.use(
  "/api/reservations",
  reservationRoutes
);

app.use("/api/staff", staffRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/payments", paymentRoutes);

// ----------------------------------------------------
// Root route
// ----------------------------------------------------

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Car Parking System API is running",

    endpoints: {
      "GET /api/test":
        "Test the API",

      "GET /api/customers":
        "Get all customers",

      "GET /api/customers/:id":
        "Get a specific customer",

      "POST /api/customers":
        "Create a new customer",

      "PUT /api/customers/:id":
        "Update a customer",

      "DELETE /api/customers/:id":
        "Delete a customer",

      "GET /api/parking-spaces":
        "Get parking spaces",

      "POST /api/parking-spaces":
        "Create a parking space",

      "PUT /api/parking-spaces/:id":
        "Update a parking space",

      "DELETE /api/parking-spaces/:id":
        "Delete a parking space",

      "GET /api/reservations":
        "Get reservations",

      "GET /api/reservations/vip":
        "Get VIP reservations",

      "GET /api/staff":
        "Get staff",

      "GET /api/dashboard":
        "Get dashboard statistics",

      "GET /api/payments":
        "Payment API information",

      "POST /api/payments/submit":
        "Submit payment information",

      "PUT /api/payments/verify/:reservationCode":
        "Verify payment",

      "GET /api/payments/reservation/:reservationCode":
        "Get payment information",
    },
  });
});

// ----------------------------------------------------
// Error handling
// ----------------------------------------------------

app.use(notFoundMiddleware);

app.use(errorMiddleware);

// ----------------------------------------------------
// Start server
// ----------------------------------------------------

app.listen(PORT, () => {
  console.log(
    `🚀 Server running on http://localhost:${PORT}`
  );

  console.log(
    `📋 API endpoints available at http://localhost:${PORT}/api`
  );
});
const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api/payments", paymentRoutes);