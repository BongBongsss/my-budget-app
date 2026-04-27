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
  // 날짜 변환 (엑셀 일련번호/문자열 처리)
  let dateRaw = row['날짜'] || row['일자'] || new Date();
  let dateStr: string;
  if (typeof dateRaw === 'number') {
    dateStr = new Date((dateRaw - 25569) * 86400 * 1000).toISOString().split('T')[0];
  } else {
    dateStr = String(dateRaw).split(' ')[0].replace(/\./g, '-');
  }

  // 시간 변환
  let timeVal = row['시간'];
  let timeStr = "";
  if (typeof timeVal === 'number') {
    const totalMinutes = Math.round(timeVal * 1440);
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  } else {
    timeStr = String(timeVal || '');
  }

  const vendor = row['내용'] || row['가맹점명'] || 'Unknown';
  const rawAmount = String(row['금액'] || '0').replace(/,/g, '').replace(/[^\d.-]/g, '');
  const amount = parseFloat(rawAmount);
  
  const typeStr = row['타입'] || '';
  const type: 'income' | 'expense' = (typeStr.includes('수입') || typeStr.includes('입금')) ? 'income' : 'expense';
  
  const category = row['대분류'] || row['카테고리'] || '기타';
  const subcategory = row['소분류'] || '';
  const currency = row['화폐'] || 'KRW';
  const source = row['결제수단'] || 'file_import';
  const memo = row['메모'] || '';

  return {
    date: dateStr,
    time: timeStr,
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
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  // raw: false를 통해 서식이 적용된 문자열로 가져오고, dateNF로 날짜 형식을 고정
  const data = XLSX.utils.sheet_to_json(worksheet, { raw: false, dateNF: 'yyyy-mm-dd' }) as any[];
  
  return data.map(normalizeData);
};
