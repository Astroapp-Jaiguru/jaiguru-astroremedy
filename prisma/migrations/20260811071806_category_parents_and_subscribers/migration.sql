-- AlterTable
ALTER TABLE "ProductCategory" ADD COLUMN     "parentId" TEXT;

-- AlterTable
ALTER TABLE "ServiceCategory" ADD COLUMN     "parentId" TEXT;

-- CreateTable
CREATE TABLE "Subscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "source" TEXT NOT NULL DEFAULT 'footer',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_email_key" ON "Subscriber"("email");

-- CreateIndex
CREATE INDEX "Subscriber_createdAt_idx" ON "Subscriber"("createdAt");

-- CreateIndex
CREATE INDEX "ProductCategory_parentId_idx" ON "ProductCategory"("parentId");

-- CreateIndex
CREATE INDEX "ServiceCategory_parentId_idx" ON "ServiceCategory"("parentId");

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ProductCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceCategory" ADD CONSTRAINT "ServiceCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ServiceCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
