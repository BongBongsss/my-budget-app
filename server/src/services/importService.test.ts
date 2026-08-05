import { describe, it, expect, vi } from 'vitest';
import { MAX_IMPORT_ROWS, getImportFileFormat, parseCSV, parseCSVForImport, parseExcelForImport } from './importService';

const readXlsxFileMock = vi.hoisted(() => vi.fn());

vi.mock('read-excel-file/node', () => ({
  default: readXlsxFileMock,
}));

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

  it('maps XLSX rows from the safe XLSX parser into import transactions', async () => {
    readXlsxFileMock.mockResolvedValueOnce([{
      sheet: 'Transactions',
      data: [
        ['date', 'time', 'type', 'category', 'vendor', 'amount', 'source'],
        ['2026-08-05', '14:30', 'expense', 'Food', 'Coffee shop', -5000, 'card'],
      ],
    }]);

    const result = await parseExcelForImport(Buffer.from('xlsx fixture'));

    expect(result).toHaveLength(1);
    expect(result[0].transaction).toEqual(expect.objectContaining({
      date: '2026-08-05',
      time: '14:30',
      type: 'expense',
      category: 'Food',
      vendor: 'Coffee shop',
      amount: 5000,
      source: 'card',
    }));
  });

  it('accepts only CSV and XLSX import filenames', () => {
    expect(getImportFileFormat('statement.csv')).toBe('csv');
    expect(getImportFileFormat('statement.xlsx')).toBe('xlsx');
    expect(getImportFileFormat('statement.xls')).toBe('legacy-xls');
    expect(getImportFileFormat('statement.pdf')).toBeNull();
  });

  it('rejects Import files that exceed the safe row limit', () => {
    const rows = Array.from({ length: MAX_IMPORT_ROWS + 1 }, (_, index) => `2026-08-05,Store ${index},1000`);
    const csv = ['date,vendor,amount', ...rows].join('\n');

    expect(() => parseCSVForImport(Buffer.from(csv, 'utf-8'))).toThrow('at most');
  });
});
