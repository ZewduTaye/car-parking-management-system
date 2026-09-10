const prisma = require("../config/database");

// GET ALL RESERVATIONS
const getReservations = async (req, res) => {
  try {
    const reservations = await prisma.reservation.findMany({
      include: {
        customer: true,
        parkingSpace: true,
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      reservations,
    });
  } catch (error) {
    console.error("Error getting reservations:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ONE RESERVATION
const getReservationById = async (req, res) => {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: {
        id: Number(req.params.id),
      },
      include: {
        customer: true,
        parkingSpace: true,
        user: true,
      },
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    res.json({
      success: true,
      reservation,
    });
  } catch (error) {
    console.error("Error getting reservation:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// CREATE RESERVATION
const createReservation = async (req, res) => {
  try {
    const {
      customerId,
      parkingSpaceId,
      userId,
      startTime,
      endTime,
    } = req.body;

    if (
      !customerId ||
      !parkingSpaceId ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Customer, parking space, start time and end time are required",
      });
    }

    const customer = await prisma.customer.findUnique({
      where: {
        id: Number(customerId),
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const parkingSpace = await prisma.parkingSpace.findUnique({
      where: {
        id: Number(parkingSpaceId),
      },
    });

    if (!parkingSpace) {
      return res.status(404).json({
        success: false,
        message: "Parking space not found",
      });
    }

    if (parkingSpace.status !== "AVAILABLE") {
      return res.status(400).json({
        success: false,
        message: "This parking space is not available",
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date or time",
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    const hours =
      (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    const totalAmount =
      hours * Number(parkingSpace.pricePerHour);

    const reservation = await prisma.reservation.create({
      data: {
        customerId: Number(customerId),
        parkingSpaceId: Number(parkingSpaceId),
        userId: userId ? Number(userId) : null,
        startTime: start,
        endTime: end,
        totalAmount: Number(totalAmount.toFixed(2)),
        status: "PENDING",
      },
      include: {
        customer: true,
        parkingSpace: true,
      },
    });

    await prisma.parkingSpace.update({
      where: {
        id: Number(parkingSpaceId),
      },
      data: {
        status: "RESERVED",
      },
    });

    res.status(201).json({
      success: true,
      message: "Reservation created successfully",
      reservation,
    });
  } catch (error) {
    console.error("Error creating reservation:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE RESERVATION STATUS
const updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "PENDING",
      "CONFIRMED",
      "COMPLETED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reservation status",
      });
    }

    const reservation = await prisma.reservation.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        status,
      },
      include: {
        customer: true,
        parkingSpace: true,
      },
    });

    res.json({
      success: true,
      message: "Reservation status updated",
      reservation,
    });
  } catch (error) {
    console.error("Error updating reservation:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE RESERVATION
const deleteReservation = async (req, res) => {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    await prisma.reservation.delete({
      where: {
        id: Number(req.params.id),
      },
    });

    await prisma.parkingSpace.update({
      where: {
        id: reservation.parkingSpaceId,
      },
      data: {
        status: "AVAILABLE",
      },
    });

    res.json({
      success: true,
      message: "Reservation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting reservation:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getReservations,
  getReservationById,
  createReservation,
  updateReservationStatus,
  deleteReservation,
};

