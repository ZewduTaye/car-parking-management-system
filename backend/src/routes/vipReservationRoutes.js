const express = require("express");

const {
  createVIPReservation,
  getVIPReservations,
  updateVIPReservation,
  cancelVIPReservation,
} = require("../controllers/vipReservationController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getVIPReservations);
router.post("/", createVIPReservation);
router.put("/:id", updateVIPReservation);
router.delete("/:id", cancelVIPReservation);

module.exports = router;