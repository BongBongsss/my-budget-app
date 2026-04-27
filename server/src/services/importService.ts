import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { autoCategorize } from './categoryService';

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
}

const normalizeData = (row: any): ParsedTransaction => {
  const dateStr = row['날짜'] || row['일자'] || new Date().toISOString().split('T')[0];
  const timeStr = row['시간'] || '';
  const typeStr = row['타입'] || '';
  const category = row['대분류'] || '기타';
  const subcategory = row['소분류'] || '';
  const vendor = row['내용'] || row['가맹점명'] || 'Unknown';
  const rawAmount = String(row['금액'] || '0').replace(/,/g, '').replace(/[^\d.-]/g, '');
  const amount = parseFloat(rawAmount);
  const currency = row['화폐'] || 'KRW';
  const source = row['결제수단'] || 'file_import';
  const memo = row['메모'] || '';

  const type: 'income' | 'expense' = (typeStr.includes('수입') || typeStr.includes('입금')) ? 'income' : 'expense';

  return {
    date: String(dateStr).split(' ')[0].replace(/\./g, '-'),
    time: String(timeStr),
    type: type,
    category: category,
    subcategory: String(subcategory),
    vendor: String(vendor),
    amount: Math.abs(isNaN(amount) ? 0 : amount),
    currency: String(currency),
    source: String(source),
    memo: String(memo)
  };
};

export const parseCSV = (buffer: Buffer): ParsedTransaction[] => {
  const csvString = buffer.toString('utf-8');
  const result = Papa.parse(csvString, { header: true, skipEmptyLines: true });
  return (result.data as any[]).map(normalizeData);
};

export const parseExcel = (buffer: Buffer): ParsedTransaction[] => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const data = XLSX.utils.sheet_to_json(worksheet) as any[];
  return data.map(normalizeData);
};
