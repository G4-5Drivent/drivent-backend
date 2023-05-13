-- CreateEnum
CREATE TYPE "RoomKind" AS ENUM ('SINGLE', 'DOUBLE', 'TRIPLE', 'QUADRUPLE');

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "roomKind" "RoomKind" NOT NULL DEFAULT E'SINGLE';
