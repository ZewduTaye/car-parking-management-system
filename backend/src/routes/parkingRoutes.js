const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getParkingSpaces,
  createParkingSpace,
  updateParkingSpace,
  deleteParkingSpace,
} = require("../controllers/parkingcontroller");

const router = express.Router();

router.use("/parking-spaces", authMiddleware);
router.get("/parking-spaces", getParkingSpaces);
router.post("/parking-spaces", createParkingSpace);
router.put("/parking-spaces/:id", updateParkingSpace);
router.delete("/parking-spaces/:id", deleteParkingSpace);

module.exports = router;
