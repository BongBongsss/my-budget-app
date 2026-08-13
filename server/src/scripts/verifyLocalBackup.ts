import fs from 'fs/promises';
import path from 'path';
import { validateFullBackup } from './backupValidation';

const verify = async () => {
  const filename = process.argv[2];
  if (!filename) throw new Error('Pass the full backup JSON path to verify.');
  const backupPath = path.resolve(filename);
  const backup = validateFullBackup(JSON.parse(await fs.readFile(backupPath, 'utf8')));
  const rowTotal = Object.values(backup.counts).reduce((sum, count) => sum + count, 0);
  console.log(`Backup verification passed: ${backup.exportedAt}; ${rowTotal} rows across ${Object.keys(backup.counts).length} tables.`);
};

verify().catch((error: unknown) => {
  console.error(`Backup verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  process.exitCode = 1;
});
