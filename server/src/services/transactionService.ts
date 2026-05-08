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

    // 2. 기존 DB의 모든 지문(Hash) 한꺼번에 가져옴
    const existingHashes = await prisma.transaction.findMany({ select: { hash: true } });
    const existingHashSet = new Set(existingHashes.map(h => h.hash).filter(Boolean));

    // 3. 삭제된 지문 확인 (테이블이 없을 경우 대비)
    let deletedHashSet = new Set();
    try {
      const deletedHashes = await prisma.deletedHash.findMany({ select: { hash: true } });
      deletedHashSet = new Set(deletedHashes.map(h => h.hash).filter(Boolean));
    } catch (e) {
      console.log("DeletedHash table not ready yet, skipping.");
    }

    const dataToInsert = [];
    const batchOccurrenceMap: Record<string, number> = {};

    for (const transaction of processedTransactions) {
      const date = transaction.date || new Date().toISOString().split('T')[0];
      const amount = Math.abs(transaction.amount || 0);
      const vendor = (transaction.vendor || 'Unknown').trim();
      const time = transaction.time || '';
      
      const baseKey = `${date}-${time}-${amount}-${vendor}`;
      const batchIndex = batchOccurrenceMap[baseKey] || 0;
      batchOccurrenceMap[baseKey] = batchIndex + 1;

      const hash = generateHash(date, amount, vendor, time, batchIndex);

      if (existingHashSet.has(hash)) continue;
      if (deletedHashSet.has(hash)) continue;
      
      dataToInsert.push({
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
        hash,
        isVerified: false, 
      });
    }

    if (dataToInsert.length === 0) return { count: 0 };

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
