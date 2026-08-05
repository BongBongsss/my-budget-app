ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "restoredAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "AuditLog_restoredAt_idx" ON "AuditLog" ("restoredAt");
