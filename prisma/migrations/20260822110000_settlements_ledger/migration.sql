CREATE TYPE "SettlementStatus" AS ENUM ('PENDING','APPROVED','REJECTED','PAID','FAILED');
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING','PROCESSING','PAID','FAILED','REVERSED');
CREATE TYPE "LedgerEntryType" AS ENUM ('DEBIT','CREDIT');

CREATE TABLE "SettlementBatch" (
  "id" TEXT NOT NULL, "vendorId" UUID NOT NULL, "periodStart" TIMESTAMP(3) NOT NULL, "periodEnd" TIMESTAMP(3) NOT NULL,
  "grossPaise" INTEGER NOT NULL, "commissionPaise" INTEGER NOT NULL, "refundsPaise" INTEGER NOT NULL DEFAULT 0,
  "netPaise" INTEGER NOT NULL, "reservedPaise" INTEGER NOT NULL DEFAULT 0, "payablePaise" INTEGER NOT NULL,
  "status" "SettlementStatus" NOT NULL DEFAULT 'PENDING', "rejectionReason" TEXT, "approvedAt" TIMESTAMP(3), "approvedBy" TEXT, "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SettlementBatch_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "SettlementItem" (
  "id" TEXT NOT NULL, "batchId" TEXT NOT NULL, "vendorOrderId" TEXT NOT NULL, "grossPaise" INTEGER NOT NULL, "commissionPaise" INTEGER NOT NULL,
  "refundPaise" INTEGER NOT NULL DEFAULT 0, "netPaise" INTEGER NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SettlementItem_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Payout" (
  "id" TEXT NOT NULL, "batchId" TEXT NOT NULL, "idempotencyKey" TEXT NOT NULL, "provider" TEXT NOT NULL DEFAULT 'MANUAL', "providerPayoutId" TEXT,
  "amountPaise" INTEGER NOT NULL, "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING', "attemptCount" INTEGER NOT NULL DEFAULT 0,
  "nextRetryAt" TIMESTAMP(3), "failureReason" TEXT, "processedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "LedgerTransaction" (
  "id" TEXT NOT NULL, "idempotencyKey" TEXT NOT NULL, "description" TEXT NOT NULL, "referenceType" TEXT NOT NULL, "referenceId" TEXT NOT NULL, "totalPaise" INTEGER NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LedgerTransaction_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "LedgerEntry" (
  "id" TEXT NOT NULL, "transactionId" TEXT NOT NULL, "account" TEXT NOT NULL, "type" "LedgerEntryType" NOT NULL, "amountPaise" INTEGER NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL, "actorId" TEXT, "action" TEXT NOT NULL, "entityType" TEXT NOT NULL, "entityId" TEXT NOT NULL, "beforeData" JSONB, "afterData" JSONB, "metadata" JSONB, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SettlementBatch_vendorId_periodStart_periodEnd_key" ON "SettlementBatch"("vendorId","periodStart","periodEnd");
CREATE UNIQUE INDEX "SettlementItem_batchId_vendorOrderId_key" ON "SettlementItem"("batchId","vendorOrderId");
CREATE UNIQUE INDEX "Payout_batchId_key" ON "Payout"("batchId");
CREATE UNIQUE INDEX "Payout_idempotencyKey_key" ON "Payout"("idempotencyKey");
CREATE UNIQUE INDEX "LedgerTransaction_idempotencyKey_key" ON "LedgerTransaction"("idempotencyKey");
CREATE INDEX "SettlementBatch_vendorId_status_idx" ON "SettlementBatch"("vendorId","status");
CREATE INDEX "SettlementBatch_status_createdAt_idx" ON "SettlementBatch"("status","createdAt");
CREATE INDEX "SettlementItem_vendorOrderId_idx" ON "SettlementItem"("vendorOrderId");
CREATE INDEX "Payout_status_nextRetryAt_idx" ON "Payout"("status","nextRetryAt");
CREATE INDEX "LedgerTransaction_referenceType_referenceId_idx" ON "LedgerTransaction"("referenceType","referenceId");
CREATE INDEX "LedgerEntry_account_createdAt_idx" ON "LedgerEntry"("account","createdAt");
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType","entityId");
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId","createdAt");
ALTER TABLE "SettlementBatch" ADD CONSTRAINT "SettlementBatch_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SettlementItem" ADD CONSTRAINT "SettlementItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "SettlementBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SettlementItem" ADD CONSTRAINT "SettlementItem_vendorOrderId_fkey" FOREIGN KEY ("vendorOrderId") REFERENCES "VendorOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "SettlementBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "LedgerTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
