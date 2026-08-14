ALTER TYPE "OrderStatus" ADD VALUE 'SHIPPED';
ALTER TABLE "Order" ADD COLUMN "city" TEXT,
ADD COLUMN "state" TEXT,
ADD COLUMN "pincode" TEXT,
ADD COLUMN "paymentMethod" TEXT,
ADD COLUMN "paymentStatus" TEXT,
ADD COLUMN "razorpayOrderId" TEXT,
ADD COLUMN "razorpayPaymentId" TEXT,
ADD COLUMN "razorpaySignature" TEXT,
ADD COLUMN "courierName" TEXT,
ADD COLUMN "trackingNumber" TEXT,
ADD COLUMN "trackingUrl" TEXT,
ADD COLUMN "trackingSentAt" TIMESTAMP(3);
CREATE INDEX "Order_razorpayOrderId_idx" ON "Order"("razorpayOrderId");
