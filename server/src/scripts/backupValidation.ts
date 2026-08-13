export type FullBackup = {
  version: number;
  type: string;
  exportedAt: string;
  excluded: string[];
  counts: Record<string, number>;
  data: Record<string, unknown[]>;
};

export const validateFullBackup = (value: unknown): FullBackup => {
  if (!value || typeof value !== 'object') throw new Error('Backup must be a JSON object.');
  const backup = value as Partial<FullBackup>;
  if (backup.version !== 1 || backup.type !== 'budget-app-full-backup') throw new Error('Unsupported backup format.');
  if (!backup.exportedAt || Number.isNaN(Date.parse(backup.exportedAt))) throw new Error('Backup exportedAt is invalid.');
  if (!Array.isArray(backup.excluded) || !backup.excluded.includes('session') || !backup.excluded.includes('_prisma_migrations')) {
    throw new Error('Backup exclusions are invalid.');
  }
  if (!backup.counts || typeof backup.counts !== 'object' || !backup.data || typeof backup.data !== 'object') {
    throw new Error('Backup counts or data is missing.');
  }

  const countNames = Object.keys(backup.counts).sort();
  const dataNames = Object.keys(backup.data).sort();
  if (countNames.join('|') !== dataNames.join('|')) throw new Error('Backup table list does not match its counts.');
  for (const tableName of dataNames) {
    const rows = backup.data[tableName];
    const count = backup.counts[tableName];
    if (!Array.isArray(rows) || !Number.isInteger(count) || count < 0 || rows.length !== count) {
      throw new Error(`Backup row count is invalid for ${tableName}.`);
    }
  }
  return backup as FullBackup;
};
