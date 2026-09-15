const prisma = require("../config/database");

const validStatuses = ["AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE"];

const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const validateSpace = ({ spaceNumber, status, pricePerHour }) => {
  if (!spaceNumber || typeof spaceNumber !== "string") {
    return "Space number is required";
  }

  if (status !== undefined && !validStatuses.includes(status)) {
    return "Invalid parking space status";
  }

  if (pricePerHour !== undefined && (Number.isNaN(Number(pricePerHour)) || Number(pricePerHour) < 0)) {
    return "Price per hour must be a non-negative number";
  }

  return null;
};

const getParkingSpaces = async (req, res) => {
  try {
    const spaces = await prisma.parkingSpace.findMany({
      orderBy: {
        spaceNumber: "asc",
      },
    });

    res.json({
      success: true,
      spaces,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "A space with this number already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Unable to create parking space",
    });
  }
};

const createParkingSpace = async (req, res) => {
  try {
    const { spaceNumber, location, status, isVIP, pricePerHour } = req.body;
    const validationError = validateSpace({ spaceNumber, status, pricePerHour });

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const space = await prisma.parkingSpace.create({
      data: {
        spaceNumber: spaceNumber.trim(),
        location: location || null,
        status: status || "AVAILABLE",
        isVIP: Boolean(isVIP),
        pricePerHour: Number(pricePerHour) || 0,
      },
    });

    res.status(201).json({
      success: true,
      message: "Parking space created",
      space,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateParkingSpace = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    const { spaceNumber, location, status, isVIP, pricePerHour } = req.body;
    const validationError = validateSpace({ spaceNumber, status, pricePerHour });

    if (!id) {
      return res.status(400).json({ success: false, message: "Invalid parking space ID" });
    }

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const space = await prisma.parkingSpace.update({
      where: { id },
      data: {
        spaceNumber: spaceNumber.trim(),
        location: location || null,
        status,
        isVIP: Boolean(isVIP),
        pricePerHour: Number(pricePerHour) || 0,
      },
    });

    res.json({
      success: true,
      message: "Parking status updated",
      space,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ success: false, message: "Parking space not found" });
    }

    if (error.code === "P2002") {
      return res.status(409).json({ success: false, message: "A space with this number already exists" });
    }

    res.status(500).json({
      success: false,
      message: "Unable to update parking space",
    });
  }
};

const deleteParkingSpace = async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({ success: false, message: "Invalid parking space ID" });
    }

    const [reservationCount, vipReservationCount] = await Promise.all([
      prisma.reservation.count({ where: { parkingSpaceId: id } }),
      prisma.vIPReservation.count({ where: { parkingSpaceId: id } }),
    ]);

    if (reservationCount > 0 || vipReservationCount > 0) {
      return res.status(409).json({
        success: false,
        message: "Parking space cannot be deleted while reservations exist",
      });
    }

    await prisma.parkingSpace.delete({ where: { id } });
    res.json({ success: true, message: "Parking space deleted" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ success: false, message: "Parking space not found" });
    }

    res.status(500).json({ success: false, message: "Unable to delete parking space" });
  }
};

module.exports = {
  getParkingSpaces,
  createParkingSpace,
  updateParkingSpace,
  deleteParkingSpace,
};