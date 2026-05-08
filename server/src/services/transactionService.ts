import prisma from '../db';
import { autoCategorize } from './categoryService';
import { randomUUID, createHash } from 'crypto';
import { Transaction } from '@prisma/client';

// 데이터의 고유 지문(hash) 생성 함수 - 정규화 적용
const generateHash = (date: string, amount: number, vendor: string, time: string = '', sequence: number = 0) => {
  const normalizedVendor = (vendor || 'Unknown').trim();
  const normalizedAmount = Math.abs(amount);
  const normalizedTime = time || '';
  
  return createHash('sha256')
    .update(`${date}-${normalizedTime}-${normalizedAmount}-${normalizedVendor}-${sequence}`)
    .digest('hex');
};

// 기존 데이터 정리 및 중복 제거
export const cleanupTransactions = async () => {
  // 날짜 순으로 정렬하여 일관된 sequence 부여
  const allTransactions = await prisma.transaction.findMany({
    orderBy: [
      { date: 'asc' },
      { time: 'asc' },
      { id: 'asc' } // 동일 시간 내 순서 보장
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

    // Hash가 없거나 틀린 경우 업데이트 시도
    if (!tx.hash || tx.hash !== correctHash) {
      try {
        await prisma.transaction.update({
          where: { id: tx.id },
          data: { 
            hash: correctHash,
            amount: normalizedAmount, // 금액 양수화 (일관성)
            vendor: normalizedVendor  // 공백 제거
          }
        });
        updatedCount++;
      } catch (err) {
        // 이미 해당 hash가 존재한다면 완전 중복이므로 삭제
        await prisma.transaction.delete({
          where: { id: tx.id }
        });
        deletedCount++;
      }
    }
  }
  return { updatedCount, deletedCount };
};

export const getAllTransactions = async (): Promise<Transaction[]> => {
  return await prisma.transaction.findMany({
    orderBy: { date: 'desc' },
  });
};

export const bulkAddTransactions = async (transactions: Partial<Transaction>[]) => {
  const processedTransactions = await Promise.all(transactions.map(async (t) => ({
    ...t,
    finalCategory: t.category || (await autoCategorize(t.vendor || 'Unknown'))
  })));

  // 카테고리 일괄 등록
  const uniqueCategories = Array.from(new Set(processedTransactions.map(t => t.finalCategory)));
  for (const name of uniqueCategories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { id: randomUUID(), name }
    });
  }

  const batchOccurrenceMap: Record<string, number> = {};
  const dataToInsert = [];

  for (const transaction of processedTransactions) {
    const date = transaction.date || new Date().toISOString().split('T')[0];
    const amount = Math.abs(transaction.amount || 0);
    const vendor = (transaction.vendor || 'Unknown').trim();
    const time = transaction.time || '';
    
    const baseKey = `${date}-${time}-${amount}-${vendor}`;
    
    // 현재 배치 내에서 몇 번째 동일 내역인지 계산
    const batchIndex = batchOccurrenceMap[baseKey] || 0;
    batchOccurrenceMap[baseKey] = batchIndex + 1;

    // 이 내역이 들어갈 수 있는 유효한 Sequence 번호를 찾음
    // (DB에 있거나, 삭제 목록에 있는 번호를 건너뜀)
    let sequence = batchIndex;
    let finalHash = "";
    let shouldSkip = false;

    // 이미 DB에 있거나 삭제된 내역을 피해서 시퀀스 결정
    // 파일 내의 중복(batchIndex)을 고려하면서 DB/삭제목록과 대조
    let foundValidSequence = false;
    let currentSequence = 0;
    let matchesInBatch = 0;

    // 실제로는 파일의 순서(batchIndex)를 유지하는 것이 중요함
    // 파일의 1번째 동일내역(batchIndex=0) -> DB/삭제목록의 1번째 내역과 매칭
    const targetMatchIndex = batchIndex; 
    let dbMatchCount = 0;
    
    // 이 부분의 로직을 단순화: 파일의 n번째 동일 내역은 Hash의 n번째 시퀀스와 1:1 매칭됩니다.
    finalHash = generateHash(date, amount, vendor, time, targetMatchIndex);

    // 1. DB에 존재하는지 확인
    const existing = await prisma.transaction.findUnique({
      where: { hash: finalHash }
    });

    if (existing) {
      continue; // 이미 DB에 있으므로 스킵
    }

    // 2. 삭제 목록에 존재하는지 확인
    const deleted = await prisma.deletedHash.findUnique({
      where: { hash: finalHash }
    });

    if (deleted) {
      continue; // 예전에 삭제했으므로 스킵
    }
    
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
      source: transaction.source || 'manual',
      memo: transaction.memo || null,
      hash: finalHash,
      isVerified: false, 
    });
  }

  if (dataToInsert.length === 0) return { count: 0 };

  return await prisma.transaction.createMany({
    data: dataToInsert as any,
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
