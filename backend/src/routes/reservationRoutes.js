const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  updateReservationStatus,
  deleteReservation,
} = require("../controllers/reservationController");

router.use(authMiddleware);

router.get("/", getReservations);

router.get("/:id", getReservationById);

router.post("/", createReservation);

router.put("/:id", updateReservation);

router.put("/:id/status", updateReservationStatus);

router.delete("/:id", deleteReservation);

module.exports = router;

