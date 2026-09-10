const prisma = require("../config/database");

const getReservations = async (req, res) => {
  try {
    const reservations = await prisma.reservation.findMany({
      include: {
        customer: true,
        parkingSpace: true,
        staff: true,
        vipReservation: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      data: reservations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createReservation = async (req, res) => {
  try {
    const {
      customerId,
      parkingSpaceId,
      startTime,
      endTime,
    } = req.body;

    const space = await prisma.parkingSpace.findUnique({
      where: {
        id: Number(parkingSpaceId),
      },
    });

    if (!space) {
      return res.status(404).json({
        success: false,
        message: "Parking space not found",
      });
    }

    if (space.status !== "AVAILABLE") {
      return res.status(400).json({
        success: false,
        message: "Parking space is not available",
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    const hours =
      Math.max(
        (end - start) / (1000 * 60 * 60),
        1
      );

    const totalAmount =
      hours * space.pricePerHour;

    const reservation =
      await prisma.reservation.create({
        data: {
          customerId: Number(customerId),
          parkingSpaceId: Number(parkingSpaceId),
          staffId: req.user ? req.user.id : null,
          startTime: start,
          endTime: end,
          totalAmount,
          status: "CONFIRMED",
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
      message: "Reservation created",
      data: reservation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const cancelReservation = async (req, res) => {
  try {
    const reservation =
      await prisma.reservation.update({
        where: {
          id: Number(req.params.id),
        },
        data: {
          status: "CANCELLED",
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
      message: "Reservation cancelled",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getReservations,
  createReservation,
  cancelReservation,
};