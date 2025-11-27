-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Prelevement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    CONSTRAINT "Prelevement_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bloc" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prelevementId" TEXT NOT NULL,
    CONSTRAINT "Bloc_prelevementId_fkey" FOREIGN KEY ("prelevementId") REFERENCES "Prelevement" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lame" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blocId" TEXT NOT NULL,
    "coloration" TEXT NOT NULL,
    CONSTRAINT "Lame_blocId_fkey" FOREIGN KEY ("blocId") REFERENCES "Bloc" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
