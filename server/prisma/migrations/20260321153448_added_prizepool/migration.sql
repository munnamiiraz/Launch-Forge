-- CreateEnum
CREATE TYPE "PrizeType" AS ENUM ('CASH', 'GIFT_CARD', 'PRODUCT', 'LIFETIME_ACCESS', 'DISCOUNT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PrizeStatus" AS ENUM ('ACTIVE', 'AWARDED', 'CANCELLED');

-- CreateTable
CREATE TABLE "leaderboard_prize" (
    "id" TEXT NOT NULL,
    "waitlistId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "prizeType" "PrizeType" NOT NULL DEFAULT 'CUSTOM',
    "value" DOUBLE PRECISION,
    "currency" TEXT,
    "rankFrom" INTEGER NOT NULL,
    "rankTo" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "status" "PrizeStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "leaderboard_prize_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "leaderboard_prize_waitlistId_idx" ON "leaderboard_prize"("waitlistId");

-- CreateIndex
CREATE INDEX "leaderboard_prize_waitlistId_status_idx" ON "leaderboard_prize"("waitlistId", "status");

-- CreateIndex
CREATE INDEX "leaderboard_prize_deletedAt_idx" ON "leaderboard_prize"("deletedAt");

-- AddForeignKey
ALTER TABLE "leaderboard_prize" ADD CONSTRAINT "leaderboard_prize_waitlistId_fkey" FOREIGN KEY ("waitlistId") REFERENCES "waitlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
