CREATE TYPE "MarketplaceProvider" AS ENUM ('NIMBUSPOST', 'DELHIVERY');
CREATE TYPE "MarketplaceOrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'FAILED');
CREATE TYPE "ShipmentStatus" AS ENUM ('PENDING', 'CREATED', 'PICKUP_SCHEDULED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'FAILED');

CREATE TABLE "MarketplaceOrder" (
  "id" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "customerName" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT,
  "deliveryAddress" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "pincode" TEXT NOT NULL,
  "subtotalPaise" INTEGER NOT NULL,
  "shippingPaise" INTEGER NOT NULL DEFAULT 0,
  "commissionPaise" INTEGER NOT NULL DEFAULT 0,
  "totalPaise" INTEGER NOT NULL,
  "paymentMethod" TEXT NOT NULL DEFAULT 'WHATSAPP',
  "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "razorpayOrderId" TEXT,
  "razorpayPaymentId" TEXT,
  "razorpaySignature" TEXT,
  "status" "MarketplaceOrderStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MarketplaceOrder_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "MarketplaceOrder_idempotencyKey_key" ON "MarketplaceOrder"("idempotencyKey");
CREATE UNIQUE INDEX "MarketplaceOrder_razorpayOrderId_key" ON "MarketplaceOrder"("razorpayOrderId");
CREATE UNIQUE INDEX "MarketplaceOrder_razorpayPaymentId_key" ON "MarketplaceOrder"("razorpayPaymentId");
CREATE INDEX "MarketplaceOrder_status_idx" ON "MarketplaceOrder"("status");
CREATE INDEX "MarketplaceOrder_createdAt_idx" ON "MarketplaceOrder"("createdAt");
CREATE INDEX "MarketplaceOrder_pincode_idx" ON "MarketplaceOrder"("pincode");

CREATE TABLE "VendorOrder" (
  "id" TEXT NOT NULL,
  "marketplaceOrderId" TEXT NOT NULL,
  "vendorId" UUID NOT NULL,
  "subtotalPaise" INTEGER NOT NULL,
  "commissionPaise" INTEGER NOT NULL DEFAULT 0,
  "shippingPaise" INTEGER NOT NULL DEFAULT 0,
  "payoutPaise" INTEGER NOT NULL DEFAULT 0,
  "status" "MarketplaceOrderStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "VendorOrder_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "VendorOrder_marketplaceOrderId_vendorId_key" ON "VendorOrder"("marketplaceOrderId", "vendorId");
CREATE INDEX "VendorOrder_vendorId_status_idx" ON "VendorOrder"("vendorId", "status");

CREATE TABLE "VendorOrderItem" (
  "id" TEXT NOT NULL,
  "vendorOrderId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "productName" TEXT NOT NULL,
  "sku" TEXT,
  "unitPaise" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL,
  "totalPaise" INTEGER NOT NULL,
  "commissionPaise" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "VendorOrderItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "VendorOrderItem_productId_idx" ON "VendorOrderItem"("productId");

CREATE TABLE "MarketplacePaymentSettings" (
  "id" TEXT NOT NULL,
  "enableMarketplaceRazorpay" BOOLEAN NOT NULL DEFAULT false,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MarketplacePaymentSettings_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ShippingSettings" (
  "id" TEXT NOT NULL,
  "defaultProvider" "MarketplaceProvider" NOT NULL DEFAULT 'NIMBUSPOST',
  "fallbackEnabled" BOOLEAN NOT NULL DEFAULT true,
  "delhiveryValuePaise" INTEGER,
  "delhiveryWeightGrams" INTEGER,
  "metroUsesDelhivery" BOOLEAN NOT NULL DEFAULT false,
  "rules" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ShippingSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Shipment" (
  "id" TEXT NOT NULL,
  "marketplaceOrderId" TEXT NOT NULL,
  "vendorOrderId" TEXT NOT NULL,
  "provider" "MarketplaceProvider" NOT NULL,
  "providerShipmentId" TEXT,
  "awbNumber" TEXT,
  "labelUrl" TEXT,
  "trackingUrl" TEXT,
  "status" "ShipmentStatus" NOT NULL DEFAULT 'PENDING',
  "rawData" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Shipment_vendorOrderId_key" ON "Shipment"("vendorOrderId");
CREATE INDEX "Shipment_provider_status_idx" ON "Shipment"("provider", "status");
CREATE INDEX "Shipment_awbNumber_idx" ON "Shipment"("awbNumber");
CREATE INDEX "Shipment_providerShipmentId_idx" ON "Shipment"("providerShipmentId");

CREATE TABLE "ShipmentEvent" (
  "id" TEXT NOT NULL,
  "shipmentId" TEXT NOT NULL,
  "eventKey" TEXT NOT NULL,
  "status" "ShipmentStatus" NOT NULL,
  "rawPayload" JSONB NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ShipmentEvent_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ShipmentEvent_shipmentId_eventKey_key" ON "ShipmentEvent"("shipmentId", "eventKey");
CREATE INDEX "ShipmentEvent_shipmentId_occurredAt_idx" ON "ShipmentEvent"("shipmentId", "occurredAt");

ALTER TABLE "VendorOrder" ADD CONSTRAINT "VendorOrder_marketplaceOrderId_fkey" FOREIGN KEY ("marketplaceOrderId") REFERENCES "MarketplaceOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VendorOrder" ADD CONSTRAINT "VendorOrder_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "VendorOrderItem" ADD CONSTRAINT "VendorOrderItem_vendorOrderId_fkey" FOREIGN KEY ("vendorOrderId") REFERENCES "VendorOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VendorOrderItem" ADD CONSTRAINT "VendorOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_marketplaceOrderId_fkey" FOREIGN KEY ("marketplaceOrderId") REFERENCES "MarketplaceOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_vendorOrderId_fkey" FOREIGN KEY ("vendorOrderId") REFERENCES "VendorOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShipmentEvent" ADD CONSTRAINT "ShipmentEvent_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
