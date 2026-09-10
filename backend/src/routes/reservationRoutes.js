const express = require("express");

const router = express.Router();

const {
  getReservations,
  getReservationById,
  createReservation,
  updateReservationStatus,
  deleteReservation,
} = require("../controllers/reservationController");

router.get("/", getReservations);

router.get("/:id", getReservationById);

router.post("/", createReservation);

router.put("/:id/status", updateReservationStatus);

router.delete("/:id", deleteReservation);

module.exports = router;

