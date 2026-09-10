// server.js

const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import routes
const parkingRoutes = require("./routes/parkingRoutes");
const customerRoutes = require("./routes/customerRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api", parkingRoutes);
app.use("/api/customers", customerRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Car Parking System API is running",
    endpoints: {
      "GET /api/test": "Test the API",
      "GET /api/customers": "Get all customers",
      "GET /api/customers/:id": "Get a specific customer",
      "POST /api/customers": "Create a new customer",
      "PUT /api/customers/:id": "Update a customer",
      "DELETE /api/customers/:id": "Delete a customer",
      "GET /api/parking-spots": "Get all parking spots",
      "GET /api/parking-spots/:id": "Get a specific parking spot",
      "POST /api/parking-spots": "Create a new parking spot",
      "PUT /api/parking-spots/:id": "Update a parking spot",
      "DELETE /api/parking-spots/:id": "Delete a parking spot",
      "POST /api/park/:spotId": "Park a car",
      "DELETE /api/unpark/:spotId": "Unpark a car",
      "GET /api/availability": "Check parking availability",
      "GET /api/status": "Get parking status",
      "GET /api/stats": "Get parking statistics"
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 API endpoints available at http://localhost:${PORT}/api`);
});