-- Unified order modal contact fields (email, preferred mode, birth details)
ALTER TABLE "Order" ADD COLUMN "email" TEXT;
ALTER TABLE "Order" ADD COLUMN "preferredMode" TEXT;
ALTER TABLE "Order" ADD COLUMN "birthDate" TEXT;
ALTER TABLE "Order" ADD COLUMN "birthTime" TEXT;
ALTER TABLE "Order" ADD COLUMN "birthPlace" TEXT;