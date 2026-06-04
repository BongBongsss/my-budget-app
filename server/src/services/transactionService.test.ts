import { describe, it, expect, vi, beforeEach } from 'vitest';

// 1. Mocking Prisma (DB 호출을 가짜로 대체하여 실제 DB를 건드리지 않게 합니다)
vi.mock('../db', () => ({
  default: {
    $transaction: vi.fn((callback) => callback({
      transaction: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        createMany: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
      auditLog: {
        create: vi.fn(),
        createMany: vi.fn(),
      },
    })),
    transaction: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      createMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
      createMany: vi.fn(),
    },
    categoryRule: {
      findMany: vi.fn(),
    },
  },
}));

import prisma from '../db';
import { getAllTransactions, deleteTransaction, bulkAddTransactions } from './transactionService';

describe('TransactionService (Soft Delete Test)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.categoryRule.findMany as any).mockResolvedValue([]);
  });

  it('getAllTransactions는 isDeleted가 false인 데이터만 가져와야 한다', async () => {
    // 가짜 응답 설정
    (prisma.transaction.findMany as any).mockResolvedValue([
      { id: '1', vendor: 'Test Store', isDeleted: false }
    ]);

    await getAllTransactions();

    // 검증: Prisma 호출 시 where 절에 isDeleted: false가 포함되었는가?
    expect(prisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isDeleted: false }
      })
    );
  });

  it('deleteTransaction은 데이터를 실제로 지우지 않고 isDeleted를 true로 바꿔야 한다 (Soft Delete)', async () => {
    const targetId = 'test-id';
    const tx = {
      transaction: {
        findUnique: vi.fn().mockResolvedValue({ id: targetId, isDeleted: false }),
        update: vi.fn().mockResolvedValue({ id: targetId, isDeleted: true }),
      },
      auditLog: {
        create: vi.fn(),
      },
    };

    (prisma.$transaction as any).mockImplementationOnce((callback: any) => callback(tx));

    await deleteTransaction(targetId);

    // 검증: delete 대신 update가 호출되었으며, isDeleted를 true로 설정했는가?
    expect(tx.transaction.update).toHaveBeenCalledWith({
      where: { id: targetId },
      data: { isDeleted: true }
    });
    expect(tx.auditLog.create).toHaveBeenCalled();
  });
  it('bulkAddTransactions does not mark repeated rows in the same import batch as duplicates', async () => {
    (prisma.transaction.findMany as any).mockResolvedValue([]);
    const tx = {
      transaction: {
        createMany: vi.fn().mockResolvedValue({ count: 2 }),
      },
      auditLog: {
        createMany: vi.fn(),
      },
    };
    (prisma.$transaction as any).mockImplementationOnce((callback: any) => callback(tx));

    const result = await bulkAddTransactions([
      {
        date: '2026-01-13',
        time: '02:28',
        type: 'expense',
        vendor: '카카오페이',
        amount: 10000,
        source: '저축예금',
      },
      {
        date: '2026-01-13',
        time: '02:28',
        type: 'expense',
        vendor: '카카오페이',
        amount: 10000,
        source: '저축예금',
      },
    ] as any);

    expect(result).toHaveLength(2);
    expect(result.every((transaction) => transaction.isDuplicate === false)).toBe(true);
  });

  it('bulkAddTransactions marks rows as duplicates only when they match verified existing transactions including type', async () => {
    (prisma.transaction.findMany as any).mockResolvedValue([
      {
        date: '2026-01-13',
        time: '02:28',
        type: 'expense',
        vendor: '카카오페이',
        amount: 10000,
        source: '저축예금',
      },
    ]);
    const tx = {
      transaction: {
        createMany: vi.fn().mockResolvedValue({ count: 2 }),
      },
      auditLog: {
        createMany: vi.fn(),
      },
    };
    (prisma.$transaction as any).mockImplementationOnce((callback: any) => callback(tx));

    const result = await bulkAddTransactions([
      {
        date: '2026-01-13',
        time: '02:28',
        type: 'expense',
        vendor: '카카오페이',
        amount: 10000,
        source: '저축예금',
      },
      {
        date: '2026-01-13',
        time: '02:28',
        type: 'income',
        vendor: '카카오페이',
        amount: 10000,
        source: '저축예금',
      },
    ] as any);

    expect(result[0].isDuplicate).toBe(true);
    expect(result[1].isDuplicate).toBe(false);
  });
});
