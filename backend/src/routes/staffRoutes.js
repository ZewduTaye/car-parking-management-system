const express = require("express");

const {
  getStaff,
} = require("../controllers/staffController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getStaff);

module.exports = router;