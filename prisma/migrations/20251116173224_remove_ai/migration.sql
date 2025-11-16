/*
  Warnings:

  - You are about to drop the `Face` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Person` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Face" DROP CONSTRAINT "Face_personId_fkey";

-- DropForeignKey
ALTER TABLE "Face" DROP CONSTRAINT "Face_postId_fkey";

-- DropForeignKey
ALTER TABLE "Face" DROP CONSTRAINT "Face_userId_fkey";

-- DropTable
DROP TABLE "Face";

-- DropTable
DROP TABLE "Person";
