import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { autoCategorize } from './categoryService';

export interface ParsedTransaction {
  date: string;
  amount: number;
  vendor: string;
  category: string;
  type: 'income' | 'expense';
  source: string;
  memo?: string;
  raw_data?: string;
}

// 새로운 헤더 포맷에 맞춘 데이터 정제 함수
const normalizeData = (row: any): ParsedTransaction => {
  // 헤더가 한글로 들어오는 경우를 처리
  const dateStr = row['날짜'] || row['일자'] || new Date().toISOString().split('T')[0];
  const vendor = row['내용'] || row['가맹점명'] || 'Unknown';
  
  const rawAmount = String(row['금액'] || '0').replace(/,/g, '').replace(/[^\d.-]/g, '');
  const amount = parseFloat(rawAmount);
  
  // 타입: '수입' 또는 '입금'이 포함되면 income, 아니면 expense
  const typeStr = row['타입'] || '';
  const type: 'income' | 'expense' = (typeStr.includes('수입') || typeStr.includes('입금')) ? 'income' : 'expense';
  
  const category = row['대분류'] || row['카테고리'] || '기타';
  const memo = row['메모'] || '';
  const source = row['결제수단'] || 'file_import';

  return {
    date: String(dateStr).split(' ')[0].replace(/\./g, '-'),
    amount: Math.abs(isNaN(amount) ? 0 : amount),
    vendor: String(vendor),
    category: category,
    type: type,
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
  
  // 헤더를 포함하여 JSON으로 변환
  const data = XLSX.utils.sheet_to_json(worksheet) as any[];
  
  return data.map(normalizeData);
};
