import { describe, it, expect } from 'vitest';
import { parseCSV } from './importService';

describe('importService', () => {
  it('skips rows that do not contain vendor and amount data', () => {
    const csv = [
      'date,vendor,amount,source',
      '2026-05-26,Valid vendor,700000,manual',
      '2026-05-27,,0,file_import',
      ',,,',
    ].join('\n');

    const result = parseCSV(Buffer.from(csv, 'utf-8'));

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(expect.objectContaining({
      date: '2026-05-26',
      vendor: 'Valid vendor',
      amount: 700000,
    }));
  });
});
