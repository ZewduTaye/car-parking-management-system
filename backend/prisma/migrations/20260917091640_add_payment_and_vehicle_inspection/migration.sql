/*
  Warnings:

  - A unique constraint covering the columns `[reservationCode]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('TELEBIRR', 'CBE', 'AWASH', 'DASHEN');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'EXPIRED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "VehicleCondition" AS ENUM ('NO_DAMAGE', 'MINOR_SCRATCH', 'EXISTING_BODY_DAMAGE');

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "arrivalTime" TIMESTAMP(3),
ADD COLUMN     "departureTime" TIMESTAMP(3),
ADD COLUMN     "paymentDeadline" TIMESTAMP(3),
ADD COLUMN     "paymentMethod" "PaymentMethod",
ADD COLUMN     "paymentReference" TEXT,
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "reservationCode" TEXT,
ADD COLUMN     "vehicleCondition" "VehicleCondition",
ADD COLUMN     "vehicleFrontPhoto" TEXT,
ADD COLUMN     "vehicleLeftPhoto" TEXT,
ADD COLUMN     "vehicleNotes" TEXT,
ADD COLUMN     "vehicleRearPhoto" TEXT,
ADD COLUMN     "vehicleRightPhoto" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_reservationCode_key" ON "Reservation"("reservationCode");
