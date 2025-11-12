/*
  Warnings:

  - Added the required column `evidence` to the `Verdict` table without a default value. This is not possible if the table is not empty.
  - Added the required column `keyClaims` to the `Verdict` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nextSteps` to the `Verdict` table without a default value. This is not possible if the table is not empty.
  - Added the required column `precedents` to the `Verdict` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Verdict" ADD COLUMN     "evidence" JSONB NOT NULL,
ADD COLUMN     "keyClaims" JSONB NOT NULL,
ADD COLUMN     "nextSteps" JSONB NOT NULL,
ADD COLUMN     "precedents" JSONB NOT NULL;
