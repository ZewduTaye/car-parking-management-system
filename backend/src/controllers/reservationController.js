const prisma = require("../config/database");

const reservationInclude = {
  customer: {
    select: {
      id: true,
      fullName: true,
      phone: true,
      email: true,
      carPlate: true,
      carModel: true,
    },
  },
  parkingSpace: {
    select: {
      id: true,
      spaceNumber: true,
      location: true,
      status: true,
      isVIP: true,
      pricePerHour: true,
    },
  },
};

const statuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const parseTimes = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (!startTime || !endTime || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { error: "Invalid reservation date or time" };
  }

  if (end <= start) {
    return { error: "End time must be after start time" };
  }

  return { start, end };
};

const findConflict = async (parkingSpaceId, start, end, excludedId = null) => {
  return prisma.reservation.findFirst({
    where: {
      parkingSpaceId,
      status: { in: ["PENDING", "CONFIRMED"] },
      ...(excludedId ? { id: { not: excludedId } } : {}),
      startTime: { lt: end },
      endTime: { gt: start },
    },
    select: { id: true },
  });
};

const syncParkingSpaceStatus = async (client, parkingSpaceId) => {
  const activeReservation = await client.reservation.findFirst({
    where: {
      parkingSpaceId,
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    select: { id: true },
  });

  const space = await client.parkingSpace.findUnique({
    where: { id: parkingSpaceId },
    select: { status: true },
  });

  if (space && !["OCCUPIED", "MAINTENANCE"].includes(space.status)) {
    await client.parkingSpace.update({
      where: { id: parkingSpaceId },
      data: { status: activeReservation ? "RESERVED" : "AVAILABLE" },
    });
  }
};

const getReservations = async (req, res) => {
  try {
    const reservations = await prisma.reservation.findMany({
      select: {
        id: true,
        startTime: true,
        endTime: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        ...reservationInclude,
      },
      orderBy: { startTime: "asc" },
    });

    res.json({ success: true, reservations });
  } catch (error) {
    console.error("Error getting reservations:", error);
    res.status(500).json({ success: false, message: "Unable to load reservations" });
  }
};

const getReservationById = async (req, res) => {
  const id = parseId(req.params.id);

  if (!id) {
    return res.status(400).json({ success: false, message: "Invalid reservation ID" });
  }

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        ...reservationInclude,
      },
    });

    if (!reservation) {
      return res.status(404).json({ success: false, message: "Reservation not found" });
    }

    res.json({ success: true, reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to load reservation" });
  }
};

const validateReferencesAndTimes = async ({ customerId, parkingSpaceId, startTime, endTime }, excludedId = null) => {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) return { error: "Customer not found", status: 404 };

  const parkingSpace = await prisma.parkingSpace.findUnique({ where: { id: parkingSpaceId } });
  if (!parkingSpace) return { error: "Parking space not found", status: 404 };

  if (["OCCUPIED", "MAINTENANCE"].includes(parkingSpace.status)) {
    return { error: "This parking space is not available", status: 409 };
  }

  const times = parseTimes(startTime, endTime);
  if (times.error) return { error: times.error, status: 400 };

  const conflict = await findConflict(parkingSpaceId, times.start, times.end, excludedId);
  if (conflict) return { error: "This parking space is already reserved for the selected time", status: 409 };

  return { customer, parkingSpace, ...times };
};

const createReservation = async (req, res) => {
  const customerId = parseId(req.body.customerId);
  const parkingSpaceId = parseId(req.body.parkingSpaceId);

  if (!customerId || !parkingSpaceId) {
    return res.status(400).json({ success: false, message: "Customer and parking space are required" });
  }

  try {
    const validation = await validateReferencesAndTimes({
      customerId,
      parkingSpaceId,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
    });

    if (validation.error) {
      return res.status(validation.status).json({ success: false, message: validation.error });
    }

    const hours = (validation.end.getTime() - validation.start.getTime()) / 3600000;
    const totalAmount = Number((hours * Number(validation.parkingSpace.pricePerHour)).toFixed(2));

    const reservation = await prisma.$transaction(async (transaction) => {
      const conflict = await transaction.reservation.findFirst({
        where: {
          parkingSpaceId,
          status: { in: ["PENDING", "CONFIRMED"] },
          startTime: { lt: validation.end },
          endTime: { gt: validation.start },
        },
        select: { id: true },
      });

      if (conflict) {
        const error = new Error("This parking space is already reserved for the selected time");
        error.code = "RESERVATION_CONFLICT";
        throw error;
      }

      const created = await transaction.reservation.create({
        data: {
          customerId,
          parkingSpaceId,
          userId: req.user.id,
          startTime: validation.start,
          endTime: validation.end,
          totalAmount,
          status: "PENDING",
        },
        select: {
          id: true,
          startTime: true,
          endTime: true,
          totalAmount: true,
          status: true,
          createdAt: true,
          ...reservationInclude,
        },
      });

      await syncParkingSpaceStatus(transaction, parkingSpaceId);
      return created;
    });

    res.status(201).json({ success: true, message: "Reservation created successfully", reservation });
  } catch (error) {
    if (error.code === "RESERVATION_CONFLICT") {
      return res.status(409).json({ success: false, message: error.message });
    }
    console.error("Error creating reservation:", error);
    res.status(500).json({ success: false, message: "Unable to create reservation" });
  }
};

const updateReservation = async (req, res) => {
  const id = parseId(req.params.id);
  const customerId = parseId(req.body.customerId);
  const parkingSpaceId = parseId(req.body.parkingSpaceId);

  if (!id || !customerId || !parkingSpaceId) {
    return res.status(400).json({ success: false, message: "Valid reservation, customer and parking space IDs are required" });
  }

  try {
    const existing = await prisma.reservation.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: "Reservation not found" });

    const validation = await validateReferencesAndTimes({
      customerId,
      parkingSpaceId,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
    }, id);

    if (validation.error) {
      return res.status(validation.status).json({ success: false, message: validation.error });
    }

    const hours = (validation.end.getTime() - validation.start.getTime()) / 3600000;
    const totalAmount = Number((hours * Number(validation.parkingSpace.pricePerHour)).toFixed(2));

    const reservation = await prisma.$transaction(async (transaction) => {
      const conflict = await transaction.reservation.findFirst({
        where: {
          parkingSpaceId,
          status: { in: ["PENDING", "CONFIRMED"] },
          id: { not: id },
          startTime: { lt: validation.end },
          endTime: { gt: validation.start },
        },
        select: { id: true },
      });

      if (conflict) {
        const error = new Error("This parking space is already reserved for the selected time");
        error.code = "RESERVATION_CONFLICT";
        throw error;
      }

      const updated = await transaction.reservation.update({
        where: { id },
        data: {
          customerId,
          parkingSpaceId,
          startTime: validation.start,
          endTime: validation.end,
          totalAmount,
        },
        select: {
          id: true,
          startTime: true,
          endTime: true,
          totalAmount: true,
          status: true,
          createdAt: true,
          ...reservationInclude,
        },
      });

      if (existing.parkingSpaceId !== parkingSpaceId) {
        await syncParkingSpaceStatus(transaction, existing.parkingSpaceId);
      }
      await syncParkingSpaceStatus(transaction, parkingSpaceId);
      return updated;
    });

    res.json({ success: true, message: "Reservation updated successfully", reservation });
  } catch (error) {
    if (error.code === "RESERVATION_CONFLICT") {
      return res.status(409).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Unable to update reservation" });
  }
};

const updateReservationStatus = async (req, res) => {
  const id = parseId(req.params.id);
  const { status } = req.body;

  if (!id || !statuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid reservation ID or status" });
  }

  try {
    const reservation = await prisma.reservation.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        ...reservationInclude,
      },
    });

    await syncParkingSpaceStatus(prisma, reservation.parkingSpace.id);
    res.json({ success: true, message: "Reservation status updated", reservation });
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ success: false, message: "Reservation not found" });
    res.status(500).json({ success: false, message: "Unable to update reservation status" });
  }
};

const deleteReservation = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "Invalid reservation ID" });

  try {
    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation) return res.status(404).json({ success: false, message: "Reservation not found" });

    await prisma.$transaction(async (transaction) => {
      await transaction.reservation.update({ where: { id }, data: { status: "CANCELLED" } });
      await syncParkingSpaceStatus(transaction, reservation.parkingSpaceId);
    });

    res.json({ success: true, message: "Reservation cancelled successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to cancel reservation" });
  }
};

module.exports = {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  updateReservationStatus,
  deleteReservation,
};
