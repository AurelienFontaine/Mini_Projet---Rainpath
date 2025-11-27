/*
  Warnings:

  - The primary key for the `Bloc` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `prelevementId` on the `Bloc` table. All the data in the column will be lost.
  - The primary key for the `Lame` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `blocId` on the `Lame` table. All the data in the column will be lost.
  - The primary key for the `Prelevement` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `pk` was added to the `Bloc` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `prelevementPk` to the `Bloc` table without a default value. This is not possible if the table is not empty.
  - Added the required column `blocPk` to the `Lame` table without a default value. This is not possible if the table is not empty.
  - The required column `pk` was added to the `Lame` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `pk` was added to the `Prelevement` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bloc" (
    "pk" TEXT NOT NULL PRIMARY KEY,
    "id" TEXT NOT NULL,
    "prelevementPk" TEXT NOT NULL,
    CONSTRAINT "Bloc_prelevementPk_fkey" FOREIGN KEY ("prelevementPk") REFERENCES "Prelevement" ("pk") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Bloc" ("id") SELECT "id" FROM "Bloc";
DROP TABLE "Bloc";
ALTER TABLE "new_Bloc" RENAME TO "Bloc";
CREATE UNIQUE INDEX "Bloc_prelevementPk_id_key" ON "Bloc"("prelevementPk", "id");
CREATE TABLE "new_Lame" (
    "pk" TEXT NOT NULL PRIMARY KEY,
    "id" TEXT NOT NULL,
    "blocPk" TEXT NOT NULL,
    "coloration" TEXT NOT NULL,
    CONSTRAINT "Lame_blocPk_fkey" FOREIGN KEY ("blocPk") REFERENCES "Bloc" ("pk") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Lame" ("coloration", "id") SELECT "coloration", "id" FROM "Lame";
DROP TABLE "Lame";
ALTER TABLE "new_Lame" RENAME TO "Lame";
CREATE UNIQUE INDEX "Lame_blocPk_id_key" ON "Lame"("blocPk", "id");
CREATE TABLE "new_Prelevement" (
    "pk" TEXT NOT NULL PRIMARY KEY,
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    CONSTRAINT "Prelevement_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Prelevement" ("caseId", "id") SELECT "caseId", "id" FROM "Prelevement";
DROP TABLE "Prelevement";
ALTER TABLE "new_Prelevement" RENAME TO "Prelevement";
CREATE UNIQUE INDEX "Prelevement_caseId_id_key" ON "Prelevement"("caseId", "id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
