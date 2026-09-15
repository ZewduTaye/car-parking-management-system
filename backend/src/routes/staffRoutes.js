const express = require("express");

const {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
} = require("../controllers/staffController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const requireAdmin = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Administrator access required",
    });
  }

  next();
};

router.use(authMiddleware, requireAdmin);
router.get("/", getStaff);
router.post("/", createStaff);
router.put("/:id", updateStaff);
router.delete("/:id", deleteStaff);

module.exports = router;