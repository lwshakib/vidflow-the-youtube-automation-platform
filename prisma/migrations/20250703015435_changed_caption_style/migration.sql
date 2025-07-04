/*
  Warnings:

  - Changed the type of `captionStyle` on the `VideoData` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "VideoData" DROP COLUMN "captionStyle",
ADD COLUMN     "captionStyle" JSONB NOT NULL;
