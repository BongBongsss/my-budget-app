import fs from 'fs/promises';
import path from 'path';
import '../env';
import prisma from '../db';

type Backup = {
  type: string;
  exportedAt: string;
  data: Record<string, unknown[]>;
};

const quoteIdentifier = (value: string) => `"${value.replace(/"/g, '""')}"`;

const restore = async () => {
  const databaseUrl = new URL(process.env.DATABASE_URL!);
  if (!['localhost', '127.0.0.1'].includes(databaseUrl.hostname) || databaseUrl.pathname.replace(/^\//, '') !== 'budget_dev') {
    throw new Error('Restore is allowed only for the local budget_dev database.');
  }

  const filename = process.argv[2];
  if (!filename) throw new Error('Pass the full backup JSON path to restore.');
  const backupPath = path.resolve(filename);
  const backup = JSON.parse(await fs.readFile(backupPath, 'utf8')) as Backup;
  if (backup.type !== 'budget-app-full-backup' || !backup.data || !backup.exportedAt) throw new Error('Invalid full backup file.');

  const tables = await prisma.$queryRawUnsafe<Array<{ table_name: string }>>(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name NOT IN ('session', '_prisma_migrations') ORDER BY table_name`
  );
  const localTableNames = tables.map(({ table_name }) => table_name);
  const backupTableNames = Object.keys(backup.data).sort();
  const restoreTableNames = localTableNames.filter((tableName) => backupTableNames.includes(tableName));
  if (backupTableNames.some((tableName) => !localTableNames.includes(tableName))) {
    const missingLocally = backupTableNames.filter((tableName) => !localTableNames.includes(tableName));
    const notInBackup = localTableNames.filter((tableName) => !backupTableNames.includes(tableName));
    throw new Error(`Backup tables do not match the local schema. Missing locally: ${missingLocally.join(', ') || 'none'}. Not in backup: ${notInBackup.join(', ') || 'none'}.`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`TRUNCATE TABLE ${localTableNames.map(quoteIdentifier).join(', ')} RESTART IDENTITY CASCADE`);
    for (const tableName of restoreTableNames) {
      const rows = backup.data[tableName];
      if (!rows?.length) continue;
      await tx.$executeRawUnsafe(
        `INSERT INTO ${quoteIdentifier(tableName)} SELECT * FROM json_populate_recordset(NULL::${quoteIdentifier(tableName)}, $1::json)`,
        JSON.stringify(rows),
      );
    }
  }, { timeout: 120000 });

  const counts = await Promise.all(restoreTableNames.map(async (tableName) => ({
    tableName,
    count: Number((await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(`SELECT COUNT(*)::bigint AS count FROM ${quoteIdentifier(tableName)}`))[0].count),
  })));
  const mismatches = counts.filter(({ tableName, count }) => count !== backup.data[tableName].length);
  if (mismatches.length) throw new Error(`Restore count verification failed: ${mismatches.map(({ tableName }) => tableName).join(', ')}`);
  console.log(`Local restore complete: ${backup.exportedAt}; ${counts.reduce((total, item) => total + item.count, 0)} rows across ${counts.length} tables.`);
};

restore()
  .catch((error: unknown) => {
    console.error(`Restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
