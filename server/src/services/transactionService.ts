import prisma from '../db';
import { autoCategorize } from './categoryService';
import { randomUUID, createHash } from 'crypto';
import { Transaction } from '@prisma/client';

// 데이터의 고유 지문(hash) 생성 함수
const generateHash = (date: string, amount: number, vendor: string, time: string = '', sequence: number = 0) => {
  return createHash('sha256')
    .update(`${date}-${time}-${amount}-${vendor}-${sequence}`)
    .digest('hex');
};

export const getAllTransactions = async (): Promise<Transaction[]> => {
  return await prisma.transaction.findMany({
    orderBy: { date: 'desc' },
  });
};

export const bulkAddTransactions = async (transactions: Partial<Transaction>[]) => {
  // 1. 모든 거래의 카테고리를 미리 확인 및 자동 분류
  interface ProcessedTx extends Partial<Transaction> {
    finalCategory: string;
  }

  const processedTransactions: ProcessedTx[] = await Promise.all(transactions.map(async (t) => ({
    ...t,
    finalCategory: t.category || (await autoCategorize(t.vendor || 'Unknown'))
  })));

  // 2. 고유 카테고리 목록 추출 후 일괄 등록 (중복 방지 upsert)
  const uniqueCategories = Array.from(new Set(processedTransactions.map(t => t.finalCategory)));
  for (const name of uniqueCategories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { id: randomUUID(), name }
    });
  }

  // 3. DB에 이미 존재하는 각 항목별 카운트를 가져와서 sequence 시작점 결정
  // (날짜, 시간, 금액, 내용이 같은 기존 내역이 몇 개 있는지 파악)
  const occurrenceMap: Record<string, number> = {};
  
  // 4. 거래 내역 데이터 생성 및 중복 방지용 해시 생성
  const data = [];
  for (const transaction of processedTransactions) {
    const date = transaction.date || new Date().toISOString().split('T')[0];
    const amount = transaction.amount || 0;
    const vendor = transaction.vendor || 'Unknown';
    const time = transaction.time || '';
    
    const baseKey = `${date}-${time}-${amount}-${vendor}`;
    
    // 현재 요청 내에서의 순번 계산
    if (occurrenceMap[baseKey] === undefined) {
      // 처음 나타난 키라면 DB에서 기존 개수를 조회해옴 (성능을 위해 최적화 가능하지만 일단 정확성 우선)
      const existingCount = await prisma.transaction.count({
        where: { date, time, amount, vendor }
      });
      occurrenceMap[baseKey] = existingCount;
    }
    
    const sequence = occurrenceMap[baseKey];
    occurrenceMap[baseKey] = sequence + 1;
    
    data.push({
      id: randomUUID(),
      date,
      time,
      type: transaction.type || 'expense',
      category: transaction.finalCategory,
      subcategory: transaction.subcategory || null,
      vendor,
      amount,
      currency: transaction.currency || 'KRW',
      source: transaction.source || 'manual',
      memo: transaction.memo || null,
      hash: generateHash(date, amount, vendor, time, sequence),
      isVerified: false, // 가져온 내역은 기본적으로 검토 대기 상태
    });
  }

  // 5. Prisma createMany의 skipDuplicates 기능을 활용하여 DB 수준에서 중복 방지
  return await prisma.transaction.createMany({
    data: data as any,
    skipDuplicates: true,
  });
};

export const verifyTransactions = async (ids: string[]) => {
  return await prisma.transaction.updateMany({
    where: { id: { in: ids } },
    data: { isVerified: true }
  });
};

export const addTransaction = async (transaction: Partial<Transaction>) => {
  const date = transaction.date || new Date().toISOString().split('T')[0];
  const time = transaction.time || '';
  const amount = transaction.amount || 0;
  const vendor = transaction.vendor || 'Unknown';
  const category = transaction.category || await autoCategorize(vendor);
  
  const existingCount = await prisma.transaction.count({
    where: { date, time, amount, vendor }
  });

  const hash = generateHash(date, amount, vendor, time, existingCount);

  return await prisma.transaction.upsert({
    where: { hash: hash },
    update: {}, 
    create: {
      id: randomUUID(),
      date,
      time,
      type: transaction.type || 'expense',
      category: category,
      subcategory: transaction.subcategory || null,
      vendor,
      amount,
      currency: transaction.currency || 'KRW',
      source: transaction.source || 'manual',
      memo: transaction.memo || null,
      hash,
      isVerified: true, // 직접 추가한 내역은 바로 승인 상태
    },
  });
};

export const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
  return await prisma.transaction.update({
    where: { id },
    data: updates,
  });
};

export const deleteTransaction = async (id: string) => {
  return await prisma.transaction.delete({
    where: { id },
  });
};

export const applyAutoRulesToExisting = async () => {
  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [
        { category: '기타' },
        { category: '' }
      ]
    }
  });

  let updatedCount = 0;
  for (const tx of transactions) {
    const newCategory = await autoCategorize(tx.vendor);
    if (newCategory !== '기타' && newCategory !== tx.category) {
      await prisma.transaction.update({
        where: { id: tx.id },
        data: { category: newCategory }
      });
      updatedCount++;
    }
  }
  return updatedCount;
};
