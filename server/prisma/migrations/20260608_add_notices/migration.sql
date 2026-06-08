CREATE TABLE "Notice" (
  "id" text NOT NULL,
  "title" text NOT NULL,
  "body" text NOT NULL,
  "isActive" boolean NOT NULL DEFAULT true,
  "readByAdmin" boolean NOT NULL DEFAULT false,
  "readByViewer" boolean NOT NULL DEFAULT false,
  "authorRole" text,
  "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notice_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Notice_isActive_idx" ON "Notice" ("isActive");
CREATE INDEX "Notice_createdAt_idx" ON "Notice" ("createdAt");
