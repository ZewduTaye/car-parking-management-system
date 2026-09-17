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

const statuses = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
];

// ---------------------------------------------------------
// Helpers
// ---------------------------------------------------------

const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const parseTimes = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (
    !startTime ||
    !endTime ||
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return {
      error: "Invalid reservation date or time",
    };
  }

  if (end <= start) {
    return {
      error: "End time must be after start time",
    };
  }

  return {
    start,
    end,
  };
};

// Generate a unique customer reservation code
const generateReservationCode = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  return `PE-${timestamp}-${random}`;
};

// Payment deadline = 15 minutes from reservation creation
const createPaymentDeadline = () => {
  return new Date(Date.now() + 15 * 60 * 1000);
};

// Check whether payment deadline has expired
const isPaymentExpired = (reservation) => {
  if (!reservation.paymentDeadline) {
    return false;
  }

  if (reservation.paymentStatus === "PAID") {
    return false;
  }

  return new Date() > new Date(reservation.paymentDeadline);
};

// Find overlapping reservations
const findConflict = async (
  parkingSpaceId,
  start,
  end,
  excludedId = null
) => {
  return prisma.reservation.findFirst({
    where: {
      parkingSpaceId,
      status: {
        in: ["PENDING", "CONFIRMED"],
      },

      ...(excludedId
        ? {
          id: {
            not: excludedId,
          },
        }
        : {}),

      startTime: {
        lt: end,
      },

      endTime: {
        gt: start,
      },
    },

    select: {
      id: true,
    },
  });
};

// Keep parking-space status synchronized
const syncParkingSpaceStatus = async (
  client,
  parkingSpaceId
) => {
  const activeReservation =
    await client.reservation.findFirst({
      where: {
        parkingSpaceId,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },

      select: {
        id: true,
      },
    });

  const space = await client.parkingSpace.findUnique({
    where: {
      id: parkingSpaceId,
    },

    select: {
      status: true,
    },
  });

  if (
    space &&
    !["OCCUPIED", "MAINTENANCE"].includes(space.status)
  ) {
    await client.parkingSpace.update({
      where: {
        id: parkingSpaceId,
      },

      data: {
        status: activeReservation
          ? "RESERVED"
          : "AVAILABLE",
      },
    });
  }
};

// ---------------------------------------------------------
// Automatically expire one reservation
// ---------------------------------------------------------

const expireReservationIfNeeded = async (
  reservation
) => {
  if (!isPaymentExpired(reservation)) {
    return reservation;
  }

  // Already cancelled
  if (reservation.status === "CANCELLED") {
    return reservation;
  }

  try {
    const expired = await prisma.$transaction(
      async (transaction) => {
        const updated =
          await transaction.reservation.update({
            where: {
              id: reservation.id,
            },

            data: {
              status: "CANCELLED",
              paymentStatus: "EXPIRED",
            },

            select: {
              id: true,
              reservationCode: true,
              startTime: true,
              endTime: true,
              totalAmount: true,
              status: true,
              paymentMethod: true,
              paymentStatus: true,
              paymentReference: true,
              paymentDeadline: true,
              createdAt: true,
              ...reservationInclude,
            },
          });

        await syncParkingSpaceStatus(
          transaction,
          reservation.parkingSpaceId
        );

        return updated;
      }
    );

    return expired;
  } catch (error) {
    console.error(
      "Error expiring reservation:",
      error
    );

    return reservation;
  }
};

// ---------------------------------------------------------
// Validate customer, parking space and reservation time
// ---------------------------------------------------------

const validateReferencesAndTimes = async (
  {
    customerId,
    parkingSpaceId,
    startTime,
    endTime,
  },
  excludedId = null
) => {
  const customer =
    await prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    });

  if (!customer) {
    return {
      error: "Customer not found",
      status: 404,
    };
  }

  const parkingSpace =
    await prisma.parkingSpace.findUnique({
      where: {
        id: parkingSpaceId,
      },
    });

  if (!parkingSpace) {
    return {
      error: "Parking space not found",
      status: 404,
    };
  }

  if (
    ["OCCUPIED", "MAINTENANCE"].includes(
      parkingSpace.status
    )
  ) {
    return {
      error: "This parking space is not available",
      status: 409,
    };
  }

  const times = parseTimes(
    startTime,
    endTime
  );

  if (times.error) {
    return {
      error: times.error,
      status: 400,
    };
  }

  const conflict = await findConflict(
    parkingSpaceId,
    times.start,
    times.end,
    excludedId
  );

  if (conflict) {
    return {
      error:
        "This parking space is already reserved for the selected time",
      status: 409,
    };
  }

  return {
    customer,
    parkingSpace,
    ...times,
  };
};

// ---------------------------------------------------------
// GET ALL RESERVATIONS
// ---------------------------------------------------------

const getReservations = async (req, res) => {
  try {
    const reservations =
      await prisma.reservation.findMany({
        select: {
          id: true,
          reservationCode: true,

          startTime: true,
          endTime: true,
          totalAmount: true,

          status: true,

          paymentMethod: true,
          paymentStatus: true,
          paymentReference: true,
          paymentDeadline: true,

          vehicleCondition: true,
          vehicleNotes: true,
          vehicleFrontPhoto: true,
          vehicleRearPhoto: true,
          vehicleLeftPhoto: true,
          vehicleRightPhoto: true,

          arrivalTime: true,
          departureTime: true,

          createdAt: true,
          updatedAt: true,

          ...reservationInclude,
        },

        orderBy: {
          startTime: "asc",
        },
      });

    // Automatically expire unpaid reservations
    const updatedReservations = [];

    for (const reservation of reservations) {
      const updated =
        await expireReservationIfNeeded(
          reservation
        );

      updatedReservations.push(updated);
    }

    res.json({
      success: true,
      reservations: updatedReservations,
    });
  } catch (error) {
    console.error(
      "Error getting reservations:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to load reservations",
    });
  }
};

// ---------------------------------------------------------
// GET RESERVATION BY ID
// ---------------------------------------------------------

const getReservationById = async (req, res) => {
  const id = parseId(req.params.id);

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Invalid reservation ID",
    });
  }

  try {
    let reservation =
      await prisma.reservation.findUnique({
        where: {
          id,
        },

        select: {
          id: true,
          reservationCode: true,

          startTime: true,
          endTime: true,
          totalAmount: true,

          status: true,

          paymentMethod: true,
          paymentStatus: true,
          paymentReference: true,
          paymentDeadline: true,

          vehicleCondition: true,
          vehicleNotes: true,
          vehicleFrontPhoto: true,
          vehicleRearPhoto: true,
          vehicleLeftPhoto: true,
          vehicleRightPhoto: true,

          arrivalTime: true,
          departureTime: true,

          createdAt: true,
          updatedAt: true,

          ...reservationInclude,
        },
      });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    reservation =
      await expireReservationIfNeeded(
        reservation
      );

    res.json({
      success: true,
      reservation,
    });
  } catch (error) {
    console.error(
      "Error getting reservation:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to load reservation",
    });
  }
};

// ---------------------------------------------------------
// CREATE RESERVATION
// ---------------------------------------------------------

const createReservation = async (req, res) => {
  const customerId = parseId(
    req.body.customerId
  );

  const parkingSpaceId = parseId(
    req.body.parkingSpaceId
  );

  if (!customerId || !parkingSpaceId) {
    return res.status(400).json({
      success: false,
      message:
        "Customer and parking space are required",
    });
  }

  try {
    const validation =
      await validateReferencesAndTimes({
        customerId,
        parkingSpaceId,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
      });

    if (validation.error) {
      return res.status(validation.status).json({
        success: false,
        message: validation.error,
      });
    }

    const hours =
      (validation.end.getTime() -
        validation.start.getTime()) /
      3600000;

    const totalAmount = Number(
      (
        hours *
        Number(
          validation.parkingSpace.pricePerHour
        )
      ).toFixed(2)
    );

    const reservation =
      await prisma.$transaction(
        async (transaction) => {
          // Double-check conflict inside transaction
          const conflict =
            await transaction.reservation.findFirst(
              {
                where: {
                  parkingSpaceId,

                  status: {
                    in: ["PENDING", "CONFIRMED"],
                  },

                  startTime: {
                    lt: validation.end,
                  },

                  endTime: {
                    gt: validation.start,
                  },
                },

                select: {
                  id: true,
                },
              }
            );

          if (conflict) {
            const error = new Error(
              "This parking space is already reserved for the selected time"
            );

            error.code =
              "RESERVATION_CONFLICT";

            throw error;
          }

          // Generate reservation code
          const reservationCode =
            generateReservationCode();

          // Start 15-minute payment window
          const paymentDeadline =
            createPaymentDeadline();

          const created =
            await transaction.reservation.create({
              data: {
                customerId,
                parkingSpaceId,
                userId: req.user.id,

                startTime: validation.start,
                endTime: validation.end,
                totalAmount,

                // Reservation
                reservationCode,
                status: "PENDING",

                // Payment
                paymentStatus: "PENDING",
                paymentDeadline,
              },

              select: {
                id: true,
                reservationCode: true,

                startTime: true,
                endTime: true,
                totalAmount: true,

                status: true,

                paymentMethod: true,
                paymentStatus: true,
                paymentReference: true,
                paymentDeadline: true,

                vehicleCondition: true,
                vehicleNotes: true,
                vehicleFrontPhoto: true,
                vehicleRearPhoto: true,
                vehicleLeftPhoto: true,
                vehicleRightPhoto: true,

                arrivalTime: true,
                departureTime: true,

                createdAt: true,
                updatedAt: true,

                ...reservationInclude,
              },
            });

          await syncParkingSpaceStatus(
            transaction,
            parkingSpaceId
          );

          return created;
        }
      );

    res.status(201).json({
      success: true,

      message:
        "Reservation created successfully. Payment must be completed within 15 minutes.",

      reservation,
    });
  } catch (error) {
    if (
      error.code ===
      "RESERVATION_CONFLICT"
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    console.error(
      "Error creating reservation:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to create reservation",
    });
  }
};

// ---------------------------------------------------------
// UPDATE RESERVATION
// ---------------------------------------------------------

const updateReservation = async (req, res) => {
  const id = parseId(req.params.id);

  const customerId = parseId(
    req.body.customerId
  );

  const parkingSpaceId = parseId(
    req.body.parkingSpaceId
  );

  if (!id || !customerId || !parkingSpaceId) {
    return res.status(400).json({
      success: false,
      message:
        "Valid reservation, customer and parking space IDs are required",
    });
  }

  try {
    const existing =
      await prisma.reservation.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    // Don't allow modification of completed reservations
    if (existing.status === "COMPLETED") {
      return res.status(409).json({
        success: false,
        message:
          "Completed reservations cannot be modified",
      });
    }

    const validation =
      await validateReferencesAndTimes(
        {
          customerId,
          parkingSpaceId,
          startTime: req.body.startTime,
          endTime: req.body.endTime,
        },
        id
      );

    if (validation.error) {
      return res.status(validation.status).json({
        success: false,
        message: validation.error,
      });
    }

    const hours =
      (validation.end.getTime() -
        validation.start.getTime()) /
      3600000;

    const totalAmount = Number(
      (
        hours *
        Number(
          validation.parkingSpace.pricePerHour
        )
      ).toFixed(2)
    );

    /*
     * If the reservation details change,
     * payment must start again.
     */
    const reservationDetailsChanged =
      existing.customerId !== customerId ||
      existing.parkingSpaceId !==
      parkingSpaceId ||
      new Date(existing.startTime).getTime() !==
      validation.start.getTime() ||
      new Date(existing.endTime).getTime() !==
      validation.end.getTime();

    const reservation =
      await prisma.$transaction(
        async (transaction) => {
          const conflict =
            await transaction.reservation.findFirst(
              {
                where: {
                  parkingSpaceId,

                  status: {
                    in: ["PENDING", "CONFIRMED"],
                  },

                  id: {
                    not: id,
                  },

                  startTime: {
                    lt: validation.end,
                  },

                  endTime: {
                    gt: validation.start,
                  },
                },

                select: {
                  id: true,
                },
              }
            );

          if (conflict) {
            const error = new Error(
              "This parking space is already reserved for the selected time"
            );

            error.code =
              "RESERVATION_CONFLICT";

            throw error;
          }

          const updated =
            await transaction.reservation.update({
              where: {
                id,
              },

              data: {
                customerId,
                parkingSpaceId,

                startTime: validation.start,
                endTime: validation.end,
                totalAmount,

                ...(reservationDetailsChanged
                  ? {
                    status: "PENDING",

                    paymentMethod: null,
                    paymentReference: null,
                    paymentStatus:
                      "PENDING",

                    paymentDeadline:
                      createPaymentDeadline(),
                  }
                  : {}),
              },

              select: {
                id: true,
                reservationCode: true,

                startTime: true,
                endTime: true,
                totalAmount: true,

                status: true,

                paymentMethod: true,
                paymentStatus: true,
                paymentReference: true,
                paymentDeadline: true,

                vehicleCondition: true,
                vehicleNotes: true,
                vehicleFrontPhoto: true,
                vehicleRearPhoto: true,
                vehicleLeftPhoto: true,
                vehicleRightPhoto: true,

                arrivalTime: true,
                departureTime: true,

                createdAt: true,
                updatedAt: true,

                ...reservationInclude,
              },
            });

          if (
            existing.parkingSpaceId !==
            parkingSpaceId
          ) {
            await syncParkingSpaceStatus(
              transaction,
              existing.parkingSpaceId
            );
          }

          await syncParkingSpaceStatus(
            transaction,
            parkingSpaceId
          );

          return updated;
        }
      );

    res.json({
      success: true,

      message: reservationDetailsChanged
        ? "Reservation updated. Payment must be completed again within 15 minutes."
        : "Reservation updated successfully",

      reservation,
    });
  } catch (error) {
    if (
      error.code ===
      "RESERVATION_CONFLICT"
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    console.error(
      "Error updating reservation:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to update reservation",
    });
  }
};

// ---------------------------------------------------------
// UPDATE RESERVATION STATUS
// ---------------------------------------------------------

const updateReservationStatus = async (
  req,
  res
) => {
  const id = parseId(req.params.id);
  const { status } = req.body;

  if (!id || !statuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid reservation ID or status",
    });
  }

  try {
    const existing =
      await prisma.reservation.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    /*
     * A reservation cannot become CONFIRMED
     * unless its payment has been verified.
     */
    if (
      status === "CONFIRMED" &&
      existing.paymentStatus !== "PAID"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment must be verified before the reservation can be confirmed",
      });
    }

    /*
     * If payment deadline has expired,
     * don't allow confirmation.
     */
    if (
      status === "CONFIRMED" &&
      isPaymentExpired(existing)
    ) {
      await prisma.$transaction(
        async (transaction) => {
          await transaction.reservation.update(
            {
              where: {
                id,
              },

              data: {
                status: "CANCELLED",
                paymentStatus: "EXPIRED",
              },
            }
          );

          await syncParkingSpaceStatus(
            transaction,
            existing.parkingSpaceId
          );
        }
      );

      return res.status(410).json({
        success: false,
        message:
          "Payment deadline has expired. Reservation has been cancelled.",
      });
    }

    const reservation =
      await prisma.reservation.update({
        where: {
          id,
        },

        data: {
          status,
        },

        select: {
          id: true,
          reservationCode: true,

          startTime: true,
          endTime: true,
          totalAmount: true,

          status: true,

          paymentMethod: true,
          paymentStatus: true,
          paymentReference: true,
          paymentDeadline: true,

          vehicleCondition: true,
          vehicleNotes: true,
          vehicleFrontPhoto: true,
          vehicleRearPhoto: true,
          vehicleLeftPhoto: true,
          vehicleRightPhoto: true,

          arrivalTime: true,
          departureTime: true,

          createdAt: true,
          updatedAt: true,

          ...reservationInclude,
        },
      });

    await syncParkingSpaceStatus(
      prisma,
      reservation.parkingSpace.id
    );

    res.json({
      success: true,
      message:
        "Reservation status updated",
      reservation,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    console.error(
      "Error updating reservation status:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to update reservation status",
    });
  }
};

// ---------------------------------------------------------
// DELETE / CANCEL RESERVATION
// ---------------------------------------------------------

const deleteReservation = async (
  req,
  res
) => {
  const id = parseId(req.params.id);

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Invalid reservation ID",
    });
  }

  try {
    const reservation =
      await prisma.reservation.findUnique({
        where: {
          id,
        },
      });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    await prisma.$transaction(
      async (transaction) => {
        await transaction.reservation.update({
          where: {
            id,
          },

          data: {
            status: "CANCELLED",

            // If it hasn't been paid, mark it cancelled/expired
            ...(reservation.paymentStatus !==
              "PAID"
              ? {
                paymentStatus: "EXPIRED",
              }
              : {}),
          },
        });

        await syncParkingSpaceStatus(
          transaction,
          reservation.parkingSpaceId
        );
      }
    );

    res.json({
      success: true,
      message:
        "Reservation cancelled successfully",
    });
  } catch (error) {
    console.error(
      "Error cancelling reservation:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to cancel reservation",
    });
  }
};

// ---------------------------------------------------------
// EXPORT
// ---------------------------------------------------------

module.exports = {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  updateReservationStatus,
  deleteReservation,
};