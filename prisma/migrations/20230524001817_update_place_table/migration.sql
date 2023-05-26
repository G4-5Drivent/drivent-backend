/*
  Warnings:

  - You are about to drop the column `capacity` on the `Activity` table. All the data in the column will be lost.
  - Added the required column `capacity` to the `Place` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "capacity";

-- AlterTable
ALTER TABLE "Place" ADD COLUMN     "capacity" INTEGER NOT NULL;
