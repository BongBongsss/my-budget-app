import type { PrismaClient } from '@prisma/client';

/**
 * PostgreSQL partial indexes for stable high-volume read paths.
 * Kept here because Prisma 6 cannot describe partial indexes in schema.prisma.
 */
export const ensureOperationalIndexes = async (prisma: PrismaClient) => {
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Transaction_active_verified_date_idx"
    ON "Transaction" ("date" DESC)
    WHERE "isDeleted" = false AND "isVerified" = true;
  `);
};
