import prisma from '../db';
import { autoCategorize } from './categoryService';
import { randomUUID, createHash } from 'crypto';
import { Transaction } from '@prisma/client';

// 데이터의 고유 지문(hash) 생성 함수
const generateHash = (date: string, amount: number, vendor: string, raw_data?: string | null, sequence: number = 0) => {
  return createHash('sha256')
    .update(`${date}-${amount}-${vendor}-${raw_data || ''}-${sequence}`)
    .digest('hex');
};

export const getAllTransactions = async (): Promise<Transaction[]> => {
  return await prisma.transaction.findMany({
    orderBy: { date: 'desc' },
  });
};

export const bulkAddTransactions = async (transactions: Partial<Transaction>[]) => {
  // 같은 날짜/금액/가맹점이 여러 개 있을 경우를 대비한 카운터
  const occurrenceMap: Record<string, number> = {};

  const data = await Promise.all(transactions.map(async (transaction) => {
    const date = transaction.date || new Date().toISOString().split('T')[0];
    const amount = transaction.amount || 0;
    const vendor = transaction.vendor || 'Unknown';
    const raw_data = transaction.raw_data || null;
    
    // 자동 카테고리 적용 (규칙 확인)
    const category = await autoCategorize(vendor);

    // 동일한 기본 정보 조합 생성
    const baseKey = `${date}-${amount}-${vendor}-${raw_data || ''}`;
    // 해당 조합이 이번 배치에서 몇 번째인지 계산
    const sequence = occurrenceMap[baseKey] || 0;
    occurrenceMap[baseKey] = sequence + 1;
    
    return {
      id: randomUUID(),
      date,
      amount,
      vendor,
      type: transaction.type || 'expense',
      category: category, // 규칙에 따른 자동 카테고리 적용
      source: transaction.source || 'manual',
      is_recurring: transaction.is_recurring || 0,
      raw_data,
      hash: generateHash(date, amount, vendor, raw_data, sequence),
      memo: transaction.memo || null,
    };
  }));

  // skipDuplicates를 사용하여 이미 존재하는 hash는 무시하고 새 것만 저장
  return await prisma.transaction.createMany({
    data,
    skipDuplicates: true,
  });
};

export const addTransaction = async (transaction: Partial<Transaction>) => {
  const date = transaction.date || new Date().toISOString().split('T')[0];
  const amount = transaction.amount || 0;
  const vendor = transaction.vendor || 'Unknown';
  const category = transaction.category || await autoCategorize(vendor);
  const raw_data = transaction.raw_data || null;
  
  // 수동 추가의 경우, 기존 DB에 동일한 내역이 몇 개 있는지 확인하여 순번 결정
  const existingCount = await prisma.transaction.count({
    where: { date, amount, vendor, raw_data }
  });

  const hash = generateHash(date, amount, vendor, raw_data, existingCount);

  return await prisma.transaction.upsert({
    where: { hash: hash },
    update: {}, 
    create: {
      id: randomUUID(),
      date,
      amount,
      vendor,
      type: transaction.type || 'expense',
      category: category,
      source: transaction.source || 'manual',
      is_recurring: transaction.is_recurring || 0,
      raw_data,
      hash,
      memo: transaction.memo || null,
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
        { category: '' },
        { category: null }
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
