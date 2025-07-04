/*
  Warnings:

  - Changed the type of `captions` on the `VideoData` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "VIDEO_PROGRESS" AS ENUM ('PENDING', 'COMPLETED');

-- AlterTable
ALTER TABLE "VideoData" ADD COLUMN     "videoProgress" "VIDEO_PROGRESS" NOT NULL DEFAULT 'PENDING',
DROP COLUMN "captions",
ADD COLUMN     "captions" JSONB NOT NULL;
