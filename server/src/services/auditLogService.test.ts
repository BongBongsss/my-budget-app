import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../db', () => ({
  default: {
    auditLog: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import prisma from '../db';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { restoreTransactionFromAuditLog } from './auditLogService';

describe('AuditLogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws NotFoundError when the log cannot be restored', async () => {
    const tx = {
      auditLog: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    };

    (prisma.$transaction as any).mockImplementationOnce((callback: any) => callback(tx));

    await expect(restoreTransactionFromAuditLog('missing-log', { role: 'admin' }))
      .rejects
      .toBeInstanceOf(NotFoundError);
  });

  it('throws BadRequestError when delete log has no transaction snapshot', async () => {
    const tx = {
      auditLog: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'log-1',
          entityType: 'transaction',
          action: 'delete',
          beforeData: {},
        }),
      },
    };

    (prisma.$transaction as any).mockImplementationOnce((callback: any) => callback(tx));

    await expect(restoreTransactionFromAuditLog('log-1', { role: 'admin' }))
      .rejects
      .toBeInstanceOf(BadRequestError);
  });

  it('restores the transaction snapshot and writes a restore log', async () => {
    const deletedTransaction = {
      id: 'tx-1',
      date: '2026-06-02',
      time: '',
      type: 'expense',
      category: '저축',
      vendor: '정지원',
      amount: 700000,
      currency: 'KRW',
      source: 'manual',
      memo: null,
      hash: 'hash-1',
      isVerified: true,
      isDuplicate: false,
      isDeleted: true,
      member: '미지정',
    };
    const restoredTransaction = {
      ...deletedTransaction,
      isDeleted: false,
    };
    const tx = {
      auditLog: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'log-1',
          entityType: 'transaction',
          entityId: 'tx-1',
          action: 'delete',
          beforeData: deletedTransaction,
        }),
        create: vi.fn(),
      },
      transaction: {
        upsert: vi.fn().mockResolvedValue(restoredTransaction),
      },
    };

    (prisma.$transaction as any).mockImplementationOnce((callback: any) => callback(tx));

    await expect(restoreTransactionFromAuditLog('log-1', { role: 'admin' }))
      .resolves
      .toEqual(restoredTransaction);

    expect(tx.transaction.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'tx-1' },
      update: expect.objectContaining({ isDeleted: false }),
    }));
    expect(tx.auditLog.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        entityType: 'transaction',
        entityId: 'tx-1',
        action: 'restore',
        actorRole: 'admin',
      }),
    }));
  });
});
