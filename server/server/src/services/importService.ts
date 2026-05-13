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

const normalizeData = (row: Record<string, any>): ParsedTransaction => {
  const dateRaw = pick(row, '날짜', '일자', 'date', 'Date');
  const timeRaw = pick(row, '시간', 'time', 'Time');
  const amountRaw = String(pick(row, '금액', 'amount', 'Amount') || '0')
    .replace(/,/g, '')
    .replace(/[^\d.-]/g, '');

  const amount = Number.parseFloat(amountRaw) || 0;
  const typeText = String(pick(row, '타입', '구분', 'type', 'Type') || '');

  let type: 'income' | 'expense';
  if (typeText.includes('수입') || typeText.includes('입금')) {
    type = 'income';
  } else if (typeText.includes('지출') || typeText.includes('출금')) {
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
    category: String(pick(row, '대분류', '카테고리', 'category', 'Category') || '기타'),
    subcategory: String(pick(row, '소분류', 'subcategory', 'Subcategory') || ''),
    vendor: String(pick(row, '내용', '가맹점명', '상호', 'vendor', 'Vendor') || 'Unknown').trim(),
    amount: Math.abs(amount),
    currency: String(pick(row, '화폐', '통화', 'currency', 'Currency') || 'KRW'),
    source: String(pick(row, '결제수단', 'source', 'Source') || 'file_import'),
    memo: String(pick(row, '메모', 'memo', 'Memo') || ''),
  };
};

export const parseCSV = (buffer: Buffer): ParsedTransaction[] => {
  const csvString = buffer.toString('utf-8');
  const result = Papa.parse(csvString, { header: true, skipEmptyLines: true });
  return (result.data as Record<string, any>[]).map(normalizeData);
};

export const parseExcel = (buffer: Buffer): ParsedTransaction[] => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const data = XLSX.utils.sheet_to_json(worksheet) as Record<string, any>[];
  return data.map(normalizeData);
};
