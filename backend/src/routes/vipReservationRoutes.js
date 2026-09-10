const express = require("express");

const {
  createVIPReservation,
  getVIPReservations,
} = require("../controllers/vipReservationController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getVIPReservations);
router.post("/", authMiddleware, createVIPReservation);

module.exports = router;