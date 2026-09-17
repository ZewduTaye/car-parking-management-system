const express = require("express");
const prisma = require("../config/database");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/*
  PAYMENT METHODS
  ----------------
  TELEBIRR
  CBE
  AWASH
  DASHEN

  PAYMENT STATUS
  ----------------
  PENDING
  PAID
  FAILED
  EXPIRED
  REFUNDED
*/

/*
|--------------------------------------------------------------------------
| GET /api/payments
|--------------------------------------------------------------------------
| Simple health/info endpoint.
| Useful for testing the payment router in a browser.
*/
router.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Payment API is running",
        endpoints: {
            "POST /api/payments/submit":
                "Submit a payment reference for a reservation",
            "PUT /api/payments/verify/:reservationCode":
                "Verify a submitted payment",
            "GET /api/payments/reservation/:reservationCode":
                "Get payment information for a reservation",
        },
    });
});

/*
|--------------------------------------------------------------------------
| POST /api/payments/submit
|--------------------------------------------------------------------------
| Customer submits payment information.
|
| Body:
| {
|   "reservationCode": "RES-ABC123",
|   "paymentMethod": "TELEBIRR",
|   "paymentReference": "TXN123456"
| }
|
| IMPORTANT:
| Never store the customer's Telebirr OTP.
*/
router.post("/submit", async (req, res) => {
    try {
        const {
            reservationCode,
            paymentMethod,
            paymentReference,
        } = req.body;

        if (!reservationCode) {
            return res.status(400).json({
                success: false,
                message: "Reservation code is required",
            });
        }

        if (!paymentMethod) {
            return res.status(400).json({
                success: false,
                message: "Payment method is required",
            });
        }

        const allowedMethods = [
            "TELEBIRR",
            "CBE",
            "AWASH",
            "DASHEN",
        ];

        if (!allowedMethods.includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid payment method. Use TELEBIRR, CBE, AWASH, or DASHEN.",
            });
        }

        if (!paymentReference) {
            return res.status(400).json({
                success: false,
                message: "Payment transaction reference is required",
            });
        }

        const reservation = await prisma.reservation.findUnique({
            where: {
                reservationCode,
            },
        });

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: "Reservation not found",
            });
        }

        /*
          Check payment deadline.
        */
        if (
            reservation.paymentDeadline &&
            new Date() > new Date(reservation.paymentDeadline) &&
            reservation.paymentStatus !== "PAID"
        ) {
            await prisma.reservation.update({
                where: {
                    id: reservation.id,
                },
                data: {
                    status: "CANCELLED",
                    paymentStatus: "EXPIRED",
                },
            });

            /*
              Release the parking space only if it was
              reserved by this expired reservation.
            */
            await prisma.parkingSpace.update({
                where: {
                    id: reservation.parkingSpaceId,
                },
                data: {
                    status: "AVAILABLE",
                },
            });

            return res.status(410).json({
                success: false,
                message:
                    "Payment deadline has expired. Your reservation has been cancelled.",
            });
        }

        /*
          Don't allow another payment submission
          after the reservation has already been paid.
        */
        if (reservation.paymentStatus === "PAID") {
            return res.status(400).json({
                success: false,
                message: "This reservation has already been paid.",
            });
        }

        const updatedReservation =
            await prisma.reservation.update({
                where: {
                    id: reservation.id,
                },
                data: {
                    paymentMethod,
                    paymentReference: paymentReference.trim(),
                    paymentStatus: "PENDING",
                },
            });

        return res.status(200).json({
            success: true,
            message:
                "Payment information submitted successfully. Waiting for verification.",
            reservation: {
                id: updatedReservation.id,
                reservationCode: updatedReservation.reservationCode,
                paymentMethod: updatedReservation.paymentMethod,
                paymentReference:
                    updatedReservation.paymentReference,
                paymentStatus:
                    updatedReservation.paymentStatus,
                paymentDeadline:
                    updatedReservation.paymentDeadline,
                status: updatedReservation.status,
            },
        });
    } catch (error) {
        console.error("Payment submission error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to submit payment information",
        });
    }
});

/*
|--------------------------------------------------------------------------
| PUT /api/payments/verify/:reservationCode
|--------------------------------------------------------------------------
| Staff/Admin verifies payment.
|
| Requires authentication.
|
| Body:
| {
|   "approved": true
| }
|
*/
router.put(
    "/verify/:reservationCode",
    authMiddleware,
    async (req, res) => {
        try {
            const { reservationCode } = req.params;
            const { approved } = req.body;

            /*
              Only ADMIN and STAFF can verify payments.
            */
            if (
                req.user.role !== "ADMIN" &&
                req.user.role !== "STAFF"
            ) {
                return res.status(403).json({
                    success: false,
                    message: "Staff or administrator access required",
                });
            }

            const reservation =
                await prisma.reservation.findUnique({
                    where: {
                        reservationCode,
                    },
                });

            if (!reservation) {
                return res.status(404).json({
                    success: false,
                    message: "Reservation not found",
                });
            }

            if (!reservation.paymentReference) {
                return res.status(400).json({
                    success: false,
                    message:
                        "No payment reference has been submitted for this reservation.",
                });
            }

            /*
              If the deadline has expired before staff verifies
              the payment, don't confirm the reservation.
            */
            if (
                reservation.paymentDeadline &&
                new Date() > new Date(reservation.paymentDeadline) &&
                reservation.paymentStatus !== "PAID"
            ) {
                await prisma.reservation.update({
                    where: {
                        id: reservation.id,
                    },
                    data: {
                        status: "CANCELLED",
                        paymentStatus: "EXPIRED",
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

                return res.status(410).json({
                    success: false,
                    message:
                        "Payment deadline has expired. Reservation cannot be confirmed.",
                });
            }

            /*
              Reject payment.
            */
            if (approved !== true) {
                const updatedReservation =
                    await prisma.reservation.update({
                        where: {
                            id: reservation.id,
                        },
                        data: {
                            paymentStatus: "FAILED",
                        },
                    });

                return res.json({
                    success: true,
                    message: "Payment marked as failed.",
                    reservation: updatedReservation,
                });
            }

            /*
              Approve payment.
            */
            const updatedReservation =
                await prisma.reservation.update({
                    where: {
                        id: reservation.id,
                    },
                    data: {
                        paymentStatus: "PAID",
                        status: "CONFIRMED",
                    },
                });

            /*
              Make sure the parking space remains reserved.
            */
            await prisma.parkingSpace.update({
                where: {
                    id: reservation.parkingSpaceId,
                },
                data: {
                    status: "RESERVED",
                },
            });

            return res.json({
                success: true,
                message:
                    "Payment verified and reservation confirmed.",
                reservation: {
                    id: updatedReservation.id,
                    reservationCode:
                        updatedReservation.reservationCode,
                    paymentMethod:
                        updatedReservation.paymentMethod,
                    paymentReference:
                        updatedReservation.paymentReference,
                    paymentStatus:
                        updatedReservation.paymentStatus,
                    status: updatedReservation.status,
                },
            });
        } catch (error) {
            console.error("Payment verification error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to verify payment",
            });
        }
    }
);

/*
|--------------------------------------------------------------------------
| GET /api/payments/reservation/:reservationCode
|--------------------------------------------------------------------------
| Get payment status for a reservation.
*/
router.get(
    "/reservation/:reservationCode",
    async (req, res) => {
        try {
            const { reservationCode } = req.params;

            const reservation =
                await prisma.reservation.findUnique({
                    where: {
                        reservationCode,
                    },
                    select: {
                        id: true,
                        reservationCode: true,
                        totalAmount: true,
                        paymentMethod: true,
                        paymentReference: true,
                        paymentStatus: true,
                        paymentDeadline: true,
                        status: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                });

            if (!reservation) {
                return res.status(404).json({
                    success: false,
                    message: "Reservation not found",
                });
            }

            return res.json({
                success: true,
                payment: reservation,
            });
        } catch (error) {
            console.error(
                "Payment information error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to retrieve payment information",
            });
        }
    }
);

module.exports = router;