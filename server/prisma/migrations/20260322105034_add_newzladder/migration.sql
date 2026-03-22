/*
  Warnings:

  - A unique constraint covering the columns `[newsLadderId]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "newsLadder" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "newsLadderId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_newsLadderId_key" ON "user"("newsLadderId");
