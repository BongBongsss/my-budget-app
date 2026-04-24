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
}

const findFieldInfo = (row: any, keywords: string[]): { value: any, key: string } | undefined => {
  const keys = Object.keys(row);
  const sortedKeys = keys.sort((a, b) => {
    if (a.includes('명') && !b.includes('명')) return -1;
    if (!a.includes('명') && b.includes('명')) return 1;
    if (a.includes('번호') && !b.includes('번호')) return 1;
    if (!a.includes('번호') && b.includes('번호')) return -1;
    return 0;
  });

  for (const key of sortedKeys) {
    const lowerKey = key.toLowerCase().replace(/\s/g, '');
    if (keywords.some(k => lowerKey.includes(k))) {
      return { value: row[key], key };
    }
  }
  return undefined;
};

const normalizeData = (row: any): ParsedTransaction => {
  const dateInfo = findFieldInfo(row, ['date', '날짜', '일자', '일시', 'time']) || { value: new Date().toISOString().split('T')[0], key: 'default' };
  const vendorInfo = findFieldInfo(row, ['가맹점명', 'vendor', '상호', '내용', '적요', 'store', 'description', 'payee', '가맹점']) || { value: 'Unknown', key: 'default' };
  const amountInfo = findFieldInfo(row, ['amount', '금액', '지출', '입금', 'price', 'cost', 'money']) || { value: '0', key: 'default' };

  const amountVal = amountInfo.value;
  const amountKey = amountInfo.key;

  const amountStr = String(amountVal).replace(/,/g, '').replace(/[^\d.-]/g, '').trim();
  const amount = parseFloat(amountStr);

  let type: 'income' | 'expense' = 'expense';
  if (amountKey.includes('수입') || amountKey.includes('입금')) {
    type = amount >= 0 ? 'income' : 'expense';
  } else if (amountKey.includes('지출') || amountKey.includes('결제') || amountKey.includes('매출') || amountKey.includes('금액')) {
    type = amount >= 0 ? 'expense' : 'income'; 
  } else {
    type = amount >= 0 ? 'income' : 'expense';
  }

  const dateStr = String(dateInfo.value).split(' ')[0].replace(/\./g, '-');

  // await added to support async autoCategorize
  // Note: normalizeData needs to be async, but CSV/Excel parsers usually are not.
  // To keep it simple, we will change it to return an object and caller handles promise
  return {
    date: dateStr,
    amount: Math.abs(isNaN(amount) ? 0 : amount),
    vendor: String(vendorInfo.value),
    category: '기타', // Will be updated later
    type: type,
    source: 'file_import'
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
  
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
  
  let headerIndex = 0;
  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const rowStr = JSON.stringify(rows[i]);
    if (
      (rowStr.includes('일자') || rowStr.includes('날짜')) && 
      (rowStr.includes('가맹점') || rowStr.includes('내용')) && 
      (rowStr.includes('금액') || rowStr.includes('금액'))
    ) {
      headerIndex = i;
      break;
    }
  }

  const data = XLSX.utils.sheet_to_json(worksheet, { range: headerIndex }) as any[];
  
  return data.map(normalizeData);
};
