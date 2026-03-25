/*
  Warnings:

  - You are about to drop the column `archivedAt` on the `waitlist` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "waitlist_archivedAt_idx";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "timezone" TEXT DEFAULT 'UTC',
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "waitlist" DROP COLUMN "archivedAt";
