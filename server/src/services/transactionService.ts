import prisma from '../db';
import { autoCategorize } from './categoryService';
import { randomUUID, createHash } from 'crypto';
import { Transaction } from '@prisma/client';

// 데이터의 고유 지문(hash) 생성 함수 - 원본 데이터와 호환성 유지
const generateHash = (date: string, amount: number, vendor: string, time: string = '', sequence: number = 0) => {
  const normalizedVendor = (vendor || 'Unknown').trim();
  const normalizedAmount = Math.abs(amount);
  const normalizedTime = time || '';
  
  return createHash('sha256')
    .update(`${date}-${normalizedTime}-${normalizedAmount}-${normalizedVendor}-${sequence}`)
    .digest('hex');
};

// ... (existing code)

export const getAllTransactions = async (): Promise<Transaction[]> => {
  return await prisma.transaction.findMany({
    orderBy: { date: 'desc' },
  });
};

export const cleanupTransactions = async () => {
  const allTransactions = await prisma.transaction.findMany({
    orderBy: [
      { date: 'asc' },
      { time: 'asc' },
      { id: 'asc' }
    ]
  });

  const occurrenceMap: Record<string, number> = {};
  let updatedCount = 0;
  let deletedCount = 0;

  for (const tx of allTransactions) {
    const normalizedVendor = (tx.vendor || 'Unknown').trim();
    const normalizedAmount = Math.abs(tx.amount);
    const normalizedTime = tx.time || '';
    
    const baseKey = `${tx.date}-${normalizedTime}-${normalizedAmount}-${normalizedVendor}`;
    const sequence = occurrenceMap[baseKey] || 0;
    occurrenceMap[baseKey] = sequence + 1;

    const correctHash = generateHash(tx.date, tx.amount, tx.vendor, tx.time || '', sequence);

    if (!tx.hash || tx.hash !== correctHash) {
      try {
        await prisma.transaction.update({
          where: { id: tx.id },
          data: { 
            hash: correctHash,
            amount: normalizedAmount,
            vendor: normalizedVendor
          }
        });
        updatedCount++;
      } catch (err) {
        await prisma.transaction.delete({
          where: { id: tx.id }
        });
        deletedCount++;
      }
    }
  }
  return { updatedCount, deletedCount };
};

export const bulkAddTransactions = async (transactions: Partial<Transaction>[]) => {
  try {
    const processedTransactions = await Promise.all(transactions.map(async (t) => ({
      ...t,
      finalCategory: t.category || (await autoCategorize(t.vendor || 'Unknown'))
    })));

    // 1. 필요한 모든 카테고리 일괄 등록
    const uniqueCategories = Array.from(new Set(processedTransactions.map(t => t.finalCategory).filter(Boolean)));
    for (const name of uniqueCategories) {
      if (name) {
        await prisma.category.upsert({
          where: { name },
          update: {},
          create: { id: randomUUID(), name }
        });
      }
    }

    // 2. 중복 체크 없이 모든 데이터를 삽입 목록에 추가
    const dataToInsert = processedTransactions.map((transaction, index) => {
      const date = transaction.date || new Date().toISOString().split('T')[0];
      const amount = Math.abs(transaction.amount || 0);
      const vendor = (transaction.vendor || 'Unknown').trim();
      const time = (transaction.time || '').trim();
      
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
        source: transaction.source || 'file_import',
        memo: transaction.memo || null,
        hash: generateHash(date, amount, vendor, time, index), // 고유성을 위해 인덱스 사용
        isVerified: false, 
      };
    });

    if (dataToInsert.length === 0) return { count: 0 };

    // 3. 모든 내역을 일괄 삽입 (중복 지문은 에러 없이 건너뜀)
    return await prisma.transaction.createMany({
      data: dataToInsert as any,
      skipDuplicates: true, 
    });
  } catch (error) {
    console.error('Error in bulkAddTransactions:', error);
    throw error;
  }
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
  const amount = Math.abs(transaction.amount || 0);
  const vendor = (transaction.vendor || 'Unknown').trim();
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
      isVerified: true, 
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
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    select: { hash: true }
  });

  if (transaction?.hash) {
    await prisma.deletedHash.upsert({
      where: { hash: transaction.hash },
      update: {},
      create: { hash: transaction.hash }
    });
  }

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
