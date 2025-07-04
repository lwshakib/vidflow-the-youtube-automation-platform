/*
  Warnings:

  - Added the required column `audioUrl` to the `VideoData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VideoData" ADD COLUMN     "audioUrl" TEXT NOT NULL;
