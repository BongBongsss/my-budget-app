import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { PrismaClient, Prisma } from '@prisma/client';
import { validateFullBackup } from './backupValidation';
import { requireProductionBackupUrl } from './backupTarget';

let prisma: PrismaClient | undefined;

const createBackup = async () => {
  // Read the explicitly configured production URL, never .env.local or an inherited URL.
  const config = dotenv.parse(await fs.readFile(path.resolve(process.cwd(), '.env')));
  const backupUrl = requireProductionBackupUrl(config.DATABASE_URL);
  prisma = new PrismaClient({ datasources: { db: { url: backupUrl } } });
  const exportedAt = new Date().toISOString();
  const data = await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe('SET TRANSACTION READ ONLY');
    const tables = await tx.$queryRawUnsafe<Array<{ table_name: string }>>(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_type = 'BASE TABLE'
       AND table_name NOT IN ('session', '_prisma_migrations')
     ORDER BY table_name`
  );

    const tableData = await Promise.all(tables.map(async ({ table_name }) => {
    const escapedTableName = table_name.replace(/"/g, '""');
    const rows = await tx.$queryRawUnsafe<Array<{ row: unknown }>>(
      `SELECT row_to_json(source_row) AS row FROM "${escapedTableName}" AS source_row`
    );
    return [table_name, rows.map(({ row }) => row)] as const;
  }));
    return Object.fromEntries(tableData);
  }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead, timeout: 120000 });

  const counts = Object.fromEntries(Object.entries(data).map(([name, rows]) => [name, rows.length]));
  const backup = validateFullBackup({
    version: 1,
    type: 'budget-app-full-backup',
    exportedAt,
    excluded: ['session', '_prisma_migrations'],
    source: { project: 'autumn-brook-74570527', branch: 'br-withered-credit-aoi7126o' },
    counts,
    data,
  });

  const backupDirectory = path.resolve(process.cwd(), 'backup');
  await fs.mkdir(backupDirectory, { recursive: true });
  const safeTimestamp = exportedAt.replace(/[:.]/g, '-');
  const backupPath = path.join(backupDirectory, `full-backup-${safeTimestamp}.json`);
  await fs.writeFile(backupPath, JSON.stringify(backup, null, 2), { encoding: 'utf8', mode: 0o600, flag: 'wx' });
  validateFullBackup(JSON.parse(await fs.readFile(backupPath, 'utf8')));

  console.log(`Local backup created: ${backupPath}`);
  console.log(`Tables included: ${Object.keys(counts).length}; rows: ${Object.values(counts).reduce((total, count) => total + Number(count), 0)}`);
};

createBackup()
  .catch((error: unknown) => {
    const diagnostic = error as { name?: string; code?: string };
    console.error(`Backup failed (${diagnostic.name || 'UnknownError'}${diagnostic.code ? `, ${diagnostic.code}` : ''}). No database data was changed.`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma?.$disconnect();
  });
