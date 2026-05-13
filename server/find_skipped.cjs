const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findSkipped() {
  console.log('🔍 Comparing Excel file with Database to find the 2 skipped items...');

  // 1. 엑셀 파일 읽기
  const workbook = XLSX.readFile('2025-04-27~2026-04-27.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  // 2. DB의 모든 데이터 가져오기
  const dbTransactions = await prisma.transaction.findMany({
    select: { date: true, time: true, amount: true, vendor: true }
  });

  const dbKeyCount = {};
  dbTransactions.forEach(tx => {
    const key = `${tx.date}-${(tx.time || '').trim()}-${Math.abs(tx.amount)}-${(tx.vendor || '').trim()}`;
    dbKeyCount[key] = (dbKeyCount[key] || 0) + 1;
  });

  // 3. 엑셀 로우별로 대조
  const skipped = [];
  const fileKeyCount = {};

  rows.forEach((row, index) => {
    // importService의 normalize 로직 모사 (간략화)
    let dateRaw = row['날짜'] || row['일자'];
    let dateStr = "";
    if (dateRaw && !isNaN(Number(dateRaw))) {
       const date = new Date((Number(dateRaw) - 25569) * 86400 * 1000);
       dateStr = date.toISOString().split('T')[0];
    } else {
       dateStr = String(dateRaw || '').split(' ')[0].replace(/\./g, '-');
    }

    const amount = Math.abs(parseFloat(String(row['금액'] || '0').replace(/,/g, '')));
    const vendor = (row['내용'] || row['가맹점명'] || '').trim();
    const time = (row['시간'] || '').trim();

    const key = `${dateStr}-${time}-${amount}-${vendor}`;
    fileKeyCount[key] = (fileKeyCount[key] || 0) + 1;

    // 만약 이 파일 내 순서가 DB에 이미 있는 개수 이하라면 스킵된 것임
    if (fileKeyCount[key] <= (dbKeyCount[key] || 0)) {
      skipped.push({ line: index + 2, date: dateStr, time, vendor, amount });
    }
  });

  console.log('\n--- Skipped Transactions (Already in DB) ---');
  skipped.forEach(s => {
    console.log(`[Line ${s.line}] ${s.date} ${s.time} | ${s.vendor} | ${s.amount}원`);
  });
  
  console.log(`\nTotal Skipped: ${skipped.length}`);
  await prisma.$disconnect();
}

findSkipped();
