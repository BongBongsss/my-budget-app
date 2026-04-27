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
  const occurrenceMap: Record<string, number> = {};

  // 1. 모든 거래의 카테고리를 미리 확인
  const processedTransactions = await Promise.all(transactions.map(async (t) => ({
    ...t,
    finalCategory: t.category || (await autoCategorize(t.vendor || 'Unknown'))
  })));

  // 2. 고유 카테고리 목록 추출 후 일괄 등록
  const uniqueCategories = Array.from(new Set(processedTransactions.map(t => t.finalCategory)));
  for (const name of uniqueCategories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { id: randomUUID(), name }
    });
  }

  // 3. 거래 내역 데이터 생성
  const data = processedTransactions.map((transaction) => {
    const date = transaction.date || new Date().toISOString().split('T')[0];
    const amount = transaction.amount || 0;
    const vendor = transaction.vendor || 'Unknown';
    const time = transaction.time || '';
    
    const baseKey = `${date}-${time}-${amount}-${vendor}`;
    const sequence = occurrenceMap[baseKey] || 0;
    occurrenceMap[baseKey] = sequence + 1;
    
    return {
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
    };
  });

  return await prisma.transaction.createMany({
    data,
    skipDuplicates: true,
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
