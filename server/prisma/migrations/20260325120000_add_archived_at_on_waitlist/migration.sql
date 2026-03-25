-- AlterTable
ALTER TABLE "waitlist" ADD COLUMN     "archivedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "waitlist_archivedAt_idx" ON "waitlist"("archivedAt");

