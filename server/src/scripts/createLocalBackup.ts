import fs from 'fs/promises';
import path from 'path';
import '../env';
import prisma from '../db';

const createBackup = async () => {
  const exportedAt = new Date().toISOString();
  const tables = await prisma.$queryRawUnsafe<Array<{ table_name: string }>>(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_type = 'BASE TABLE'
       AND table_name NOT IN ('session', '_prisma_migrations')
     ORDER BY table_name`
  );

  const tableData = await Promise.all(tables.map(async ({ table_name }) => {
    const escapedTableName = table_name.replace(/"/g, '""');
    const rows = await prisma.$queryRawUnsafe<Array<{ row: unknown }>>(
      `SELECT row_to_json(source_row) AS row FROM "${escapedTableName}" AS source_row`
    );
    return [table_name, rows.map(({ row }) => row)] as const;
  }));
  const data = Object.fromEntries(tableData);

  const counts = Object.fromEntries(Object.entries(data).map(([name, rows]) => [name, rows.length]));
  const backup = {
    version: 1,
    type: 'budget-app-full-backup',
    exportedAt,
    excluded: ['session', '_prisma_migrations'],
    counts,
    data,
  };

  const backupDirectory = path.resolve(process.cwd(), 'backup');
  await fs.mkdir(backupDirectory, { recursive: true });
  const safeTimestamp = exportedAt.replace(/[:.]/g, '-');
  const backupPath = path.join(backupDirectory, `full-backup-${safeTimestamp}.json`);
  await fs.writeFile(backupPath, JSON.stringify(backup, null, 2), { encoding: 'utf8', mode: 0o600 });

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
    await prisma.$disconnect();
  });
