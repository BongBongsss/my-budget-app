const XLSX = require('xlsx');

function debugFile() {
  console.log('🐞 Debugging Excel file rows...');
  const workbook = XLSX.readFile('debug_import.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  
  // raw: true 옵션을 주어 빈 줄이나 이상한 데이터를 포함해서 가져옴
  const data = XLSX.utils.sheet_to_json(sheet, { raw: true });
  console.log(`Total rows read by XLSX: ${data.length}`);

  // 상위 5개와 하위 5개 출력하여 구조 확인
  console.log('\n--- First 5 rows ---');
  console.log(JSON.stringify(data.slice(0, 5), null, 2));

  console.log('\n--- Last 5 rows ---');
  console.log(JSON.stringify(data.slice(-5), null, 2));
}

debugFile();
