import { describe, expect, it } from 'vitest';
import { validateFullBackup } from './backupValidation';

const validBackup = () => ({
  version: 1,
  type: 'budget-app-full-backup',
  exportedAt: '2026-08-13T00:00:00.000Z',
  excluded: ['session', '_prisma_migrations'],
  counts: { Transaction: 2, Asset: 0 },
  data: { Transaction: [{ id: '1' }, { id: '2' }], Asset: [] },
});

describe('validateFullBackup', () => {
  it('accepts a complete backup with matching table counts', () => {
    expect(validateFullBackup(validBackup()).counts.Transaction).toBe(2);
  });

  it('rejects a backup whose declared table count is wrong', () => {
    const backup = validBackup();
    backup.counts.Transaction = 1;
    expect(() => validateFullBackup(backup)).toThrow('Transaction');
  });

  it('rejects a backup that could include sessions or migration metadata', () => {
    const backup = validBackup();
    backup.excluded = ['session'];
    expect(() => validateFullBackup(backup)).toThrow('exclusions');
  });
});
