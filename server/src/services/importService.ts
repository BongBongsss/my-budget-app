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
  isDuplicate?: boolean;
}

const normalizeData = (row: any): ParsedTransaction => {
  // 1. 날짜 (엑셀 '날짜' 또는 '일자')
  let dateRaw = row['날짜'] || row['일자'];
  let dateStr: string;
  if (dateRaw && !isNaN(Number(dateRaw)) && typeof dateRaw !== 'object' && String(dateRaw).length > 4) {
    const date = new Date((Number(dateRaw) - 25569) * 86400 * 1000);
    dateStr = date.toISOString().split('T')[0];
  } else {
    dateStr = String(dateRaw || new Date().toISOString().split('T')[0]).split(' ')[0].replace(/\./g, '-');
  }

  // 2. 시간 (엑셀 '시간')
  let timeRaw = row['시간'];
  let timeStr = "";
  if (timeRaw !== undefined && !isNaN(Number(timeRaw)) && Number(timeRaw) < 1) {
    const totalSeconds = Math.round(Number(timeRaw) * 86400);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  } else {
    timeStr = String(timeRaw || '');
  }

  // 3. 내용 (엑셀 '내용' -> 시스템 'vendor')
  const content = String(row['내용'] || row['가맹점명'] || 'Unknown').trim();

  // 4. 금액 (엑셀 '금액')
  const rawAmount = String(row['금액'] || '0').replace(/,/g, '').replace(/[^\d.-]/g, '');
  let amount = parseFloat(rawAmount);
  if (isNaN(amount)) amount = 0;
  
  // 5. 타입 (엑셀 '타입' 및 금액 부호 기반 판별)
  const typeStr = String(row['타입'] || '');
  let type: 'income' | 'expense';

  if (typeStr.includes('수입') || typeStr.includes('입금')) {
    type = 'income';
  } else if (typeStr.includes('지출') || typeStr.includes('출금')) {
    type = 'expense';
  } else {
    // '이체' 등 기타 타입은 금액의 부호에 따라 결정
    type = amount >= 0 ? 'income' : 'expense';
  }
  
  // 6. 분류 (엑셀 '대분류', '소분류')
  const category = row['대분류'] || row['카테고리'] || '기타';
  const subcategory = row['소분류'] || '';

  // 7. 기타 (엑셀 '화폐', '결제수단', '메모')
  const currency = row['화폐'] || 'KRW';
  const source = row['결제수단'] || 'file_import';
  const memo = row['메모'] || '';

  return {
    date: dateStr,
    time: timeStr,
    type: type,
    category: String(category),
    subcategory: String(subcategory),
    vendor: content, // '내용' 컬럼 데이터
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
