const prisma = require("../config/database");

const getUtcDayBounds = () => {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
};

const getDashboard = async (req, res) => {
  try {
    const { start, end } = getUtcDayBounds();
    const activeReservationWhere = { status: { in: ["PENDING", "CONFIRMED"] } };

    const [
      totalParkingSpaces,
      availableSpaces,
      occupiedSpaces,
      reservedSpaces,
      totalCustomers,
      totalReservations,
      activeReservations,
      totalVipReservations,
      activeVipReservations,
      totalStaff,
      todaysNormalReservations,
      todaysVipReservations,
      recentReservations,
    ] = await Promise.all([
      prisma.parkingSpace.count(),
      prisma.parkingSpace.count({ where: { status: "AVAILABLE" } }),
      prisma.parkingSpace.count({ where: { status: "OCCUPIED" } }),
      prisma.parkingSpace.count({ where: { status: "RESERVED" } }),
      prisma.customer.count(),
      prisma.reservation.count({ where: { status: { not: "CANCELLED" } } }),
      prisma.reservation.count({ where: activeReservationWhere }),
      prisma.vIPReservation.count({ where: { status: { not: "CANCELLED" } } }),
      prisma.vIPReservation.count({ where: activeReservationWhere }),
      prisma.user.count(),
      prisma.reservation.count({
        where: { startTime: { gte: start, lt: end }, status: { not: "CANCELLED" } },
      }),
      prisma.vIPReservation.count({
        where: { startTime: { gte: start, lt: end }, status: { not: "CANCELLED" } },
      }),
      prisma.reservation.findMany({
        where: { status: { not: "CANCELLED" } },
        select: {
          id: true,
          createdAt: true,
          customer: { select: { fullName: true, carPlate: true } },
          parkingSpace: { select: { spaceNumber: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
    ]);

    const totalCapacity = totalParkingSpaces || 1;

    res.json({
      success: true,
      stats: {
        totalParkingSpaces,
        availableSpaces,
        occupiedSpaces,
        reservedSpaces,
        totalCustomers,
        totalReservations: totalReservations + totalVipReservations,
        activeReservations: activeReservations + activeVipReservations,
        vipReservations: totalVipReservations,
        totalStaff,
        todaysReservations: todaysNormalReservations + todaysVipReservations,
        occupancyPercentage: Math.round((occupiedSpaces / totalCapacity) * 100),
      },
      recentActivity: recentReservations.map((reservation) => ({
        type: "reservation",
        title: "New reservation",
        detail: `${reservation.customer.fullName} · ${reservation.parkingSpace.spaceNumber}`,
        createdAt: reservation.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error getting dashboard statistics:", error);
    res.status(500).json({ success: false, message: "Unable to load dashboard statistics" });
  }
};

module.exports = { getDashboard };