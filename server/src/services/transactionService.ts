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

    // 2. 기존 DB의 모든 데이터를 가져와서 [날짜-시간-금액-업체]별로 개수를 셈 (중복 판별용)
    const existingTransactions = await prisma.transaction.findMany({
      select: { date: true, time: true, amount: true, vendor: true }
    });

    const dbOccurrenceMap: Record<string, number> = {};
    for (const tx of existingTransactions) {
      const key = `${tx.date}-${(tx.time || '').trim()}-${Math.abs(tx.amount)}-${(tx.vendor || '').trim()}`;
      dbOccurrenceMap[key] = (dbOccurrenceMap[key] || 0) + 1;
    }

    const dataToInsert = [];
    const fullResultList = [];
    const batchOccurrenceMap: Record<string, number> = {};

    for (let i = 0; i < processedTransactions.length; i++) {
      const transaction = processedTransactions[i];
      const date = transaction.date || new Date().toISOString().split('T')[0];
      const amount = Math.abs(transaction.amount || 0);
      const vendor = (transaction.vendor || 'Unknown').trim();
      const time = (transaction.time || '').trim();

      const key = `${date}-${time}-${amount}-${vendor}`;

      const currentBatchCount = (batchOccurrenceMap[key] || 0) + 1;
      batchOccurrenceMap[key] = currentBatchCount;

      const existingCountInDb = dbOccurrenceMap[key] || 0;
      const isDuplicate = currentBatchCount <= existingCountInDb;

      const txData = {
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
        hash: generateHash(date, amount, vendor, time, i + 10000), 
        isVerified: false, 
        isDuplicate: isDuplicate,
      };

      // 결과 리스트에는 무조건 추가 (428개 보장)
      fullResultList.push(txData);

      // DB 저장은 정말 새로운 것만
      if (!isDuplicate) {
        dataToInsert.push(txData);
      }
    }

    // 3. 중복이 아닌 내역들만 실제로 DB에 저장
    if (dataToInsert.length > 0) {
      await prisma.transaction.createMany({
        data: dataToInsert as any,
        skipDuplicates: true, 
      });
    }

    // 4. 프론트엔드로 전체 리스트 반환
    return fullResultList;
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
