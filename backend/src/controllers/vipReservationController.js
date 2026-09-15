const prisma = require("../config/database");

const vipInclude = {
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
  const [normalReservation, vipReservation] = await Promise.all([
    prisma.reservation.findFirst({
      where: {
        parkingSpaceId,
        status: { in: ["PENDING", "CONFIRMED"] },
        startTime: { lt: end },
        endTime: { gt: start },
      },
      select: { id: true },
    }),
    prisma.vIPReservation.findFirst({
      where: {
        parkingSpaceId,
        status: { in: ["PENDING", "CONFIRMED"] },
        ...(excludedId ? { id: { not: excludedId } } : {}),
        startTime: { lt: end },
        endTime: { gt: start },
      },
      select: { id: true },
    }),
  ]);

  return normalReservation || vipReservation;
};

const syncParkingSpaceStatus = async (client, parkingSpaceId) => {
  const [normalReservation, vipReservation] = await Promise.all([
    client.reservation.findFirst({
      where: { parkingSpaceId, status: { in: ["PENDING", "CONFIRMED"] } },
      select: { id: true },
    }),
    client.vIPReservation.findFirst({
      where: { parkingSpaceId, status: { in: ["PENDING", "CONFIRMED"] } },
      select: { id: true },
    }),
  ]);
  const space = await client.parkingSpace.findUnique({
    where: { id: parkingSpaceId },
    select: { status: true },
  });

  if (space && !["OCCUPIED", "MAINTENANCE"].includes(space.status)) {
    await client.parkingSpace.update({
      where: { id: parkingSpaceId },
      data: { status: normalReservation || vipReservation ? "RESERVED" : "AVAILABLE" },
    });
  }
};

const validateRequest = async ({ customerId, parkingSpaceId, startTime, endTime }, excludedId = null) => {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) return { error: "Customer not found", status: 404 };

  const parkingSpace = await prisma.parkingSpace.findUnique({ where: { id: parkingSpaceId } });
  if (!parkingSpace) return { error: "Parking space not found", status: 404 };
  if (!parkingSpace.isVIP) return { error: "Selected parking space is not a VIP space", status: 400 };
  if (["OCCUPIED", "MAINTENANCE"].includes(parkingSpace.status)) {
    return { error: "This parking space is not available", status: 409 };
  }

  const times = parseTimes(startTime, endTime);
  if (times.error) return { error: times.error, status: 400 };

  const conflict = await findConflict(parkingSpaceId, times.start, times.end, excludedId);
  if (conflict) return { error: "This parking space is already reserved for the selected time", status: 409 };

  return { parkingSpace, ...times };
};

const getVIPReservations = async (req, res) => {
  try {
    const reservations = await prisma.vIPReservation.findMany({
      select: {
        id: true,
        startTime: true,
        endTime: true,
        totalAmount: true,
        status: true,
        specialRequest: true,
        createdAt: true,
        ...vipInclude,
      },
      orderBy: { startTime: "asc" },
    });

    res.json({ success: true, reservations });
  } catch (error) {
    console.error("Error getting VIP reservations:", error);
    res.status(500).json({ success: false, message: "Unable to load VIP reservations" });
  }
};

const createVIPReservation = async (req, res) => {
  const customerId = parseId(req.body.customerId);
  const parkingSpaceId = parseId(req.body.parkingSpaceId);

  if (!customerId || !parkingSpaceId) {
    return res.status(400).json({ success: false, message: "Customer and VIP parking space are required" });
  }

  try {
    const validation = await validateRequest({
      customerId,
      parkingSpaceId,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
    });
    if (validation.error) return res.status(validation.status).json({ success: false, message: validation.error });

    const hours = (validation.end.getTime() - validation.start.getTime()) / 3600000;
    const totalAmount = Number((hours * Number(validation.parkingSpace.pricePerHour)).toFixed(2));

    const reservation = await prisma.$transaction(async (transaction) => {
      const conflict = await Promise.all([
        transaction.reservation.findFirst({
          where: { parkingSpaceId, status: { in: ["PENDING", "CONFIRMED"] }, startTime: { lt: validation.end }, endTime: { gt: validation.start } },
          select: { id: true },
        }),
        transaction.vIPReservation.findFirst({
          where: { parkingSpaceId, status: { in: ["PENDING", "CONFIRMED"] }, startTime: { lt: validation.end }, endTime: { gt: validation.start } },
          select: { id: true },
        }),
      ]);
      if (conflict[0] || conflict[1]) {
        const error = new Error("This parking space is already reserved for the selected time");
        error.code = "VIP_RESERVATION_CONFLICT";
        throw error;
      }

      const created = await transaction.vIPReservation.create({
        data: {
          customerId,
          parkingSpaceId,
          startTime: validation.start,
          endTime: validation.end,
          totalAmount,
          specialRequest: req.body.specialRequest || null,
          status: "PENDING",
        },
        select: {
          id: true,
          startTime: true,
          endTime: true,
          totalAmount: true,
          status: true,
          specialRequest: true,
          createdAt: true,
          ...vipInclude,
        },
      });

      await syncParkingSpaceStatus(transaction, parkingSpaceId);
      return created;
    });

    res.status(201).json({ success: true, message: "VIP reservation created successfully", reservation });
  } catch (error) {
    if (error.code === "VIP_RESERVATION_CONFLICT") {
      return res.status(409).json({ success: false, message: error.message });
    }
    console.error("Error creating VIP reservation:", error);
    res.status(500).json({ success: false, message: "Unable to create VIP reservation" });
  }
};

const updateVIPReservation = async (req, res) => {
  const id = parseId(req.params.id);
  const customerId = parseId(req.body.customerId);
  const parkingSpaceId = parseId(req.body.parkingSpaceId);
  if (!id || !customerId || !parkingSpaceId) return res.status(400).json({ success: false, message: "Valid reservation, customer and VIP parking space IDs are required" });

  try {
    const existing = await prisma.vIPReservation.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: "VIP reservation not found" });

    const validation = await validateRequest({ customerId, parkingSpaceId, startTime: req.body.startTime, endTime: req.body.endTime }, id);
    if (validation.error) return res.status(validation.status).json({ success: false, message: validation.error });

    const hours = (validation.end.getTime() - validation.start.getTime()) / 3600000;
    const totalAmount = Number((hours * Number(validation.parkingSpace.pricePerHour)).toFixed(2));
    const reservation = await prisma.$transaction(async (transaction) => {
      const conflicts = await Promise.all([
        transaction.reservation.findFirst({
          where: { parkingSpaceId, status: { in: ["PENDING", "CONFIRMED"] }, startTime: { lt: validation.end }, endTime: { gt: validation.start } },
          select: { id: true },
        }),
        transaction.vIPReservation.findFirst({
          where: { parkingSpaceId, status: { in: ["PENDING", "CONFIRMED"] }, id: { not: id }, startTime: { lt: validation.end }, endTime: { gt: validation.start } },
          select: { id: true },
        }),
      ]);

      if (conflicts[0] || conflicts[1]) {
        const error = new Error("This parking space is already reserved for the selected time");
        error.code = "VIP_RESERVATION_CONFLICT";
        throw error;
      }

      const updated = await transaction.vIPReservation.update({
        where: { id },
        data: { customerId, parkingSpaceId, startTime: validation.start, endTime: validation.end, totalAmount, specialRequest: req.body.specialRequest || null },
        select: { id: true, startTime: true, endTime: true, totalAmount: true, status: true, specialRequest: true, createdAt: true, ...vipInclude },
      });
      if (existing.parkingSpaceId !== parkingSpaceId) await syncParkingSpaceStatus(transaction, existing.parkingSpaceId);
      await syncParkingSpaceStatus(transaction, parkingSpaceId);
      return updated;
    });

    res.json({ success: true, message: "VIP reservation updated successfully", reservation });
  } catch (error) {
    if (error.code === "VIP_RESERVATION_CONFLICT") {
      return res.status(409).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Unable to update VIP reservation" });
  }
};

const cancelVIPReservation = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "Invalid VIP reservation ID" });

  try {
    const reservation = await prisma.vIPReservation.findUnique({ where: { id } });
    if (!reservation) return res.status(404).json({ success: false, message: "VIP reservation not found" });

    await prisma.$transaction(async (transaction) => {
      await transaction.vIPReservation.update({ where: { id }, data: { status: "CANCELLED" } });
      await syncParkingSpaceStatus(transaction, reservation.parkingSpaceId);
    });

    res.json({ success: true, message: "VIP reservation cancelled successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to cancel VIP reservation" });
  }
};

module.exports = {
  getVIPReservations,
  createVIPReservation,
  updateVIPReservation,
  cancelVIPReservation,
};
