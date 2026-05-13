import { describe, it, expect, vi, beforeEach } from 'vitest';

// 1. Mocking Prisma (DB 호출을 가짜로 대체하여 실제 DB를 건드리지 않게 합니다)
vi.mock('../db', () => ({
  default: {
    transaction: {
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

import prisma from '../db';
import { getAllTransactions, deleteTransaction } from './transactionService';

describe('TransactionService (Soft Delete Test)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    await deleteTransaction(targetId);

    // 검증: delete 대신 update가 호출되었으며, isDeleted를 true로 설정했는가?
    expect(prisma.transaction.update).toHaveBeenCalledWith({
      where: { id: targetId },
      data: { isDeleted: true }
    });
  });
});
