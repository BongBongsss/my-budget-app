import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParsedTransaction {
  date: string;
  time?: string;
  type: 'income' | 'expense';
  category: string;
  subcategory?: string;
  vendor: string;
  amount: number;
  currency?: string;
  source: string;
  memo?: string;
  isDuplicate?: boolean;
}

export interface ParsedImportRow {
  rowNumber: number;
  rawData: Record<string, any>;
  transaction: ParsedTransaction;
  invalidReasons: string[];
}

const K = {
  date: '\uB0A0\uC9DC',
  day: '\uC77C\uC790',
  time: '\uC2DC\uAC04',
  amount: '\uAE08\uC561',
  content: '\uB0B4\uC6A9',
  merchant: '\uAC00\uB9F9\uC810\uBA85',
  name: '\uC0C1\uD638',
  type: '\uAD6C\uBD84',
  income: '\uC218\uC785',
  deposit: '\uC785\uAE08',
  expense: '\uC9C0\uCD9C',
  withdrawal: '\uCD9C\uAE08',
  category: '\uB300\uBD84\uB958',
  categoryAlt: '\uCE74\uD14C\uACE0\uB9AC',
  subcategory: '\uC18C\uBD84\uB958',
  currency: '\uD1B5\uD654',
  source: '\uACB0\uC81C\uC218\uB2E8',
  memo: '\uBA54\uBAA8',
  other: '\uAE30\uD0C0',
};

const excelSerialDateToIso = (serial: number): string => {
  const date = new Date((serial - 25569) * 86400 * 1000);
  return date.toISOString().split('T')[0];
};

const excelSerialTimeToText = (serial: number): string => {
  const totalSeconds = Math.round(serial * 86400);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const normalizeDate = (value: unknown): string => {
  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }

  if (value !== undefined && value !== null && !isNaN(Number(value)) && String(value).length > 4) {
    return excelSerialDateToIso(Number(value));
  }

  return String(value || new Date().toISOString().split('T')[0])
    .split(' ')[0]
    .replace(/\./g, '-');
};

const pick = (row: Record<string, any>, ...keys: string[]) => {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return undefined;
};

const hasImportableData = (row: Record<string, any>) => {
  const vendor = pick(row, K.content, K.merchant, K.name, 'vendor', 'Vendor');
  const amount = pick(row, K.amount, 'amount', 'Amount');

  return vendor !== undefined && amount !== undefined;
};

const normalizeData = (row: Record<string, any>): ParsedTransaction => {
  const dateRaw = pick(row, K.date, K.day, 'date', 'Date');
  const timeRaw = pick(row, K.time, 'time', 'Time');
  const amountRaw = String(pick(row, K.amount, 'amount', 'Amount') || '0')
    .replace(/,/g, '')
    .replace(/[^\d.-]/g, '');

  const amount = Number.parseFloat(amountRaw) || 0;
  const typeText = String(pick(row, K.type, 'type', 'Type') || '');

  let type: 'income' | 'expense';
  if (typeText.includes(K.income) || typeText.includes(K.deposit)) {
    type = 'income';
  } else if (typeText.includes(K.expense) || typeText.includes(K.withdrawal)) {
    type = 'expense';
  } else {
    type = amount >= 0 ? 'income' : 'expense';
  }

  const time =
    timeRaw !== undefined && !isNaN(Number(timeRaw)) && Number(timeRaw) < 1
      ? excelSerialTimeToText(Number(timeRaw))
      : String(timeRaw || '');

  return {
    date: normalizeDate(dateRaw),
    time,
    type,
    category: String(pick(row, K.category, K.categoryAlt, 'category', 'Category') || K.other),
    subcategory: String(pick(row, K.subcategory, 'subcategory', 'Subcategory') || ''),
    vendor: String(pick(row, K.content, K.merchant, K.name, 'vendor', 'Vendor') || 'Unknown').trim(),
    amount: Math.abs(amount),
    currency: String(pick(row, K.currency, 'currency', 'Currency') || 'KRW'),
    source: String(pick(row, K.source, 'source', 'Source') || 'file_import'),
    memo: String(pick(row, K.memo, 'memo', 'Memo') || ''),
  };
};

const getInvalidReasons = (row: Record<string, any>, transaction?: ParsedTransaction) => {
  const reasons: string[] = [];

  if (!hasImportableData(row)) reasons.push('vendor or amount missing');

  if (transaction) {
    if (!transaction.vendor || transaction.vendor === 'Unknown') reasons.push('vendor is Unknown');
    if (Math.abs(Number(transaction.amount || 0)) <= 0) reasons.push('amount is zero');
  }

  return Array.from(new Set(reasons));
};

const parseRowsForImport = (data: Record<string, any>[]): ParsedImportRow[] => {
  return data.map((row, index) => {
    const transaction = normalizeData(row);
    return {
      rowNumber: index + 2,
      rawData: row,
      transaction,
      invalidReasons: getInvalidReasons(row, transaction),
    };
  });
};

export const parseCSV = (buffer: Buffer): ParsedTransaction[] => {
  const csvString = buffer.toString('utf-8');
  const result = Papa.parse(csvString, { header: true, skipEmptyLines: true });
  return (result.data as Record<string, any>[]).filter(hasImportableData).map(normalizeData);
};

export const parseCSVForImport = (buffer: Buffer): ParsedImportRow[] => {
  const csvString = buffer.toString('utf-8');
  const result = Papa.parse(csvString, { header: true, skipEmptyLines: true });
  return parseRowsForImport(result.data as Record<string, any>[]);
};

export const parseExcel = (buffer: Buffer): ParsedTransaction[] => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const data = XLSX.utils.sheet_to_json(worksheet) as Record<string, any>[];
  return data.filter(hasImportableData).map(normalizeData);
};

export const parseExcelForImport = (buffer: Buffer): ParsedImportRow[] => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const data = XLSX.utils.sheet_to_json(worksheet) as Record<string, any>[];
  return parseRowsForImport(data);
};
