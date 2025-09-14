/*
  Warnings:

  - Added the required column `description` to the `room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."room" ADD COLUMN     "description" TEXT NOT NULL;
