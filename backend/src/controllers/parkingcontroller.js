const prisma = require("../config/database");

const getParkingSpaces = async (req, res) => {
  try {
    const spaces = await prisma.parkingSpace.findMany({
      orderBy: {
        spaceNumber: "asc",
      },
    });

    res.json({
      success: true,
      data: spaces,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createParkingSpace = async (req, res) => {
  try {
    const {
      spaceNumber,
      floor,
      type,
      pricePerHour,
    } = req.body;

    const space = await prisma.parkingSpace.create({
      data: {
        spaceNumber,
        floor,
        type: type || "STANDARD",
        pricePerHour: Number(pricePerHour) || 0,
      },
    });

    res.status(201).json({
      success: true,
      message: "Parking space created",
      data: space,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateParkingStatus = async (req, res) => {
  try {
    const space = await prisma.parkingSpace.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        status: req.body.status,
      },
    });

    res.json({
      success: true,
      message: "Parking status updated",
      data: space,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getParkingSpaces,
  createParkingSpace,
  updateParkingStatus,
};