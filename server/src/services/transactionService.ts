import prisma from '../db';
import { autoCategorize } from './categoryService';
import { randomUUID, createHash } from 'crypto';
import { Transaction } from '@prisma/client';

export const getAllTransactions = async (): Promise<Transaction[]> => {
  return await prisma.transaction.findMany({
    where: { isVerified: true }, // 전체 탭은 승인된 것만
    orderBy: { date: 'desc' },
  });
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

    // 2. 아무것도 묻지 않고 모든 데이터를 신규 내역으로 생성
    const dataToInsert = processedTransactions.map((transaction) => {
      const date = transaction.date || new Date().toISOString().split('T')[0];
      const amount = transaction.amount || 0;
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
        // 중복 방지 로직을 완전히 껐으므로, DB 충돌을 막기 위해 완전 랜덤 Hash 부여
        hash: randomUUID(), 
        isVerified: false, 
        isDuplicate: false, 
      };
    });

    if (dataToInsert.length === 0) return [];

    // 3. 모든 내역을 일괄 삽입
    await prisma.transaction.createMany({
      data: dataToInsert as any,
    });

    return dataToInsert;
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
  
  return await prisma.transaction.create({
    data: {
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
      hash: randomUUID(),
      isVerified: true, 
      isDuplicate: false
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

export const bulkDeleteTransactions = async (ids: string[]) => {
  return await prisma.transaction.deleteMany({
    where: { id: { in: ids } }
  });
};

export const cleanupTransactions = async () => {
  // 중복 제거 기능이 필요 없으므로 빈 결과 반환
  return { updatedCount: 0, deletedCount: 0 };
};

export const applyAutoRulesToExisting = async () => {
  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [
        { category: '기타' },
        { category: '' }
      ],
      isVerified: true
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
