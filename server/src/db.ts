import './env';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export const initDb = async () => {
  // Session table check/creation
  try {
    // 1. Create table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL
      ) WITH (OIDS=FALSE);
    `);

    // 2. Add primary key constraint if missing
    const [primaryKeyState] = await prisma.$queryRaw<Array<{ has_primary_key: boolean; sid_is_primary_key: boolean }>>`
      SELECT
        EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conrelid = '"session"'::regclass
            AND contype = 'p'
        ) AS "has_primary_key",
        EXISTS (
          SELECT 1
          FROM pg_constraint c
          JOIN pg_attribute a
            ON a.attrelid = c.conrelid
           AND a.attnum = ANY(c.conkey)
          WHERE c.conrelid = '"session"'::regclass
            AND c.contype = 'p'
            AND a.attname = 'sid'
        ) AS "sid_is_primary_key";
    `;

    if (!primaryKeyState.sid_is_primary_key) {
      if (primaryKeyState.has_primary_key) {
        throw new Error('Session table has a primary key, but it is not on sid.');
      }

      await prisma.$executeRawUnsafe(`
        ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
      `);
    }

    // 3. Create index
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `);

    console.log("Session table check/creation completed.");
  } catch (err) {
    console.error("Failed to create session table:", err);
    throw err;
  }

  // Audit log table check/creation
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "AuditLog" (
        "id" text NOT NULL PRIMARY KEY,
        "entityType" text NOT NULL,
        "entityId" text NOT NULL,
        "action" text NOT NULL,
        "beforeData" jsonb,
        "afterData" jsonb,
        "actorRole" text,
        "ipAddress" text,
        "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    `);
    await prisma.$executeRawUnsafe(`ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "batchId" text;`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AuditLog_batchId_idx" ON "AuditLog" ("batchId");`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "restoredAt" timestamp(3);`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AuditLog_restoredAt_idx" ON "AuditLog" ("restoredAt");`);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "AuditLog_entityType_entityId_idx" ON "AuditLog" ("entityType", "entityId");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog" ("action");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog" ("createdAt");
    `);

    console.log("Audit log table check/creation completed.");
  } catch (err) {
    console.error("Failed to create audit log table:", err);
    throw err;
  }

  // Import staging table check/creation and legacy unverified transaction migration
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ImportBatch" (
        "id" text NOT NULL PRIMARY KEY,
        "filename" text,
        "totalRows" integer NOT NULL DEFAULT 0,
        "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ImportRow" (
        "id" text NOT NULL PRIMARY KEY,
        "batchId" text,
        "rowNumber" integer,
        "status" text NOT NULL,
        "invalidReason" text,
        "sourceTransactionId" text UNIQUE,
        "date" text NOT NULL,
        "time" text,
        "type" text NOT NULL,
        "category" text NOT NULL,
        "subcategory" text,
        "vendor" text NOT NULL,
        "amount" double precision NOT NULL,
        "currency" text,
        "source" text,
        "memo" text,
        "member" text NOT NULL DEFAULT '미지정',
        "rawData" jsonb,
        "committedAt" timestamp(3),
        "transactionId" text,
        "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "ImportRow"
      ADD COLUMN IF NOT EXISTS "member" text NOT NULL DEFAULT '미지정';
    `);

    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'ImportRow_batchId_fkey'
        ) THEN
          ALTER TABLE "ImportRow"
          ADD CONSTRAINT "ImportRow_batchId_fkey"
          FOREIGN KEY ("batchId") REFERENCES "ImportBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
      END $$;
    `);

    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ImportRow_status_idx" ON "ImportRow" ("status");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ImportRow_batchId_idx" ON "ImportRow" ("batchId");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ImportRow_createdAt_idx" ON "ImportRow" ("createdAt");`);

    await prisma.$executeRawUnsafe(`
      INSERT INTO "ImportRow" (
        "id", "status", "sourceTransactionId", "date", "time", "type", "category", "subcategory",
        "vendor", "amount", "currency", "source", "memo", "member", "rawData", "createdAt", "updatedAt"
      )
      SELECT
        'legacy-' || "id",
        CASE WHEN "isDuplicate" THEN 'duplicate' ELSE 'new' END,
        "id",
        "date",
        "time",
        "type",
        "category",
        "subcategory",
        "vendor",
        "amount",
        "currency",
        "source",
        "memo",
        "member",
        to_jsonb(t),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      FROM "Transaction" t
      WHERE "isVerified" = false
        AND "isDeleted" = false
        AND NOT EXISTS (
          SELECT 1 FROM "ImportRow" r WHERE r."sourceTransactionId" = t."id"
        );
    `);

    await prisma.$executeRawUnsafe(`
      UPDATE "Transaction"
      SET "isDeleted" = true
      WHERE "isVerified" = false
        AND "isDeleted" = false
        AND EXISTS (
          SELECT 1 FROM "ImportRow" r WHERE r."sourceTransactionId" = "Transaction"."id"
        );
    `);

    console.log("Import staging table check/migration completed.");
  } catch (err) {
    console.error("Failed to initialize import staging tables:", err);
    throw err;
  }

  // Review request table check/creation
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ReviewRequest" (
        "id" text NOT NULL PRIMARY KEY,
        "targetType" text NOT NULL,
        "targetId" text,
        "type" text NOT NULL DEFAULT 'question',
        "title" text NOT NULL,
        "body" text NOT NULL,
        "status" text NOT NULL DEFAULT 'open',
        "authorRole" text,
        "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ReviewRequest_targetType_targetId_idx" ON "ReviewRequest" ("targetType", "targetId");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ReviewRequest_status_idx" ON "ReviewRequest" ("status");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ReviewRequest_createdAt_idx" ON "ReviewRequest" ("createdAt");`);

    console.log("Review request table check/creation completed.");
  } catch (err) {
    console.error("Failed to initialize review request table:", err);
    throw err;
  }

  // Notice table check/creation
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Notice" (
        "id" text NOT NULL PRIMARY KEY,
        "title" text NOT NULL,
        "body" text NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "readByAdmin" boolean NOT NULL DEFAULT false,
        "readByViewer" boolean NOT NULL DEFAULT false,
        "authorRole" text,
        "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Notice_isActive_idx" ON "Notice" ("isActive");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Notice_createdAt_idx" ON "Notice" ("createdAt");`);

    console.log("Notice table check/creation completed.");
  } catch (err) {
    console.error("Failed to initialize notice table:", err);
    throw err;
  }

  // Deferred rule suggestions: postpone a recommendation without changing transaction data.
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "DeferredRuleSuggestion" (
        "id" text NOT NULL PRIMARY KEY,
        "vendorKey" text NOT NULL UNIQUE,
        "deferredUntil" timestamp(3) NOT NULL,
        "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "DeferredRuleSuggestion_deferredUntil_idx" ON "DeferredRuleSuggestion" ("deferredUntil");`);
    console.log('Deferred rule suggestion table check/creation completed.');
  } catch (err) {
    console.error('Failed to initialize deferred rule suggestions:', err);
    throw err;
  }

  // Initial password seeding
  try {
    const existingAdmin = await prisma.auth.findUnique({ where: { role: 'admin' } });
    if (!existingAdmin) {
      const adminPassword = process.env.ADMIN_PASSWORD;
      if (!adminPassword) {
        throw new Error('ADMIN_PASSWORD is required to initialize the first admin account.');
      }

      const hash = await bcrypt.hash(adminPassword, 10);
      await prisma.auth.create({ data: { role: 'admin', passwordHash: hash } });
      console.log("Initial Admin password seeded to DB.");
    }

    const existingViewer = await prisma.auth.findUnique({ where: { role: 'viewer' } });
    if (!existingViewer) {
      const viewerPassword = process.env.VIEWER_PASSWORD;
      if (!viewerPassword) {
        throw new Error('VIEWER_PASSWORD is required to initialize the first viewer account.');
      }

      const hash = await bcrypt.hash(viewerPassword, 10);
      await prisma.auth.create({ data: { role: 'viewer', passwordHash: hash } });
      console.log("Initial Viewer password seeded to DB.");
    }
  } catch (err) {
    console.error("Auth seeding failed:", err);
    throw err;
  }

  // Default categories seeding
  try {
    const categories = ['생활비', '자기계발', '문화/여가', '건강/의료', '교통/통신', '기타'];

    for (const name of categories) {
      await prisma.category.upsert({
        where: { name },
        update: {},
        create: { id: Date.now().toString() + name, name },
      });
    }
  } catch (err) {
    console.error("Category seeding failed:", err);
    throw err;
  }
};

export default prisma;
