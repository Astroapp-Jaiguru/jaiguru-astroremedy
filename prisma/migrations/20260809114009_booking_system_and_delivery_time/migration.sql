-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "estimatedDeliveryTime" TEXT;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "slotDuration" INTEGER;

-- CreateTable
CREATE TABLE "BookingBlock" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "timeSlots" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookingBlock_date_idx" ON "BookingBlock"("date");
