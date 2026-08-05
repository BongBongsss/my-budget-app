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
import { BadRequestError, ConflictError, NotFoundError } from '../utils/errors';
import { restoreAuditLogs, restoreLatestAuditBatch, restoreTransactionFromAuditLog } from './auditLogService';

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
        update: vi.fn(),
      },
    };

    (prisma.$transaction as any).mockImplementationOnce((callback: any) => callback(tx));

    await expect(restoreTransactionFromAuditLog('log-1', { role: 'admin' }))
      .rejects
      .toBeInstanceOf(BadRequestError);
  });

  it('refuses to restore an older update over a newer transaction change', async () => {
    const beforeData = { id: 'tx-1', category: 'Food' };
    const afterData = { id: 'tx-1', category: 'Transport' };
    const tx = {
      auditLog: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'log-update-1', entityType: 'transaction', entityId: 'tx-1', action: 'update',
          beforeData, afterData,
        }),
        update: vi.fn(),
      },
      transaction: {
        findUnique: vi.fn().mockResolvedValue({ id: 'tx-1', category: 'Housing' }),
        update: vi.fn(),
      },
    };
    (prisma.$transaction as any).mockImplementationOnce((callback: any) => callback(tx));

    await expect(restoreTransactionFromAuditLog('log-update-1', { role: 'admin' }))
      .rejects
      .toBeInstanceOf(ConflictError);
    expect(tx.transaction.update).not.toHaveBeenCalled();
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
        update: vi.fn(),
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
    expect(tx.auditLog.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'log-1' },
      data: { restoredAt: expect.any(Date) },
    }));
  });

  it('restores an ignored import row to its previous status and writes a restore log', async () => {
    const deletedImportRow = {
      id: 'row-1',
      batchId: 'batch-1',
      rowNumber: 3,
      status: 'duplicate',
      invalidReason: null,
      sourceTransactionId: null,
      date: '2026-06-02',
      time: '',
      type: 'expense',
      category: 'Food',
      subcategory: '',
      vendor: 'Store',
      amount: 12000,
      currency: 'KRW',
      source: 'card',
      memo: null,
      member: 'unknown',
      rawData: { vendor: 'Store' },
      committedAt: null,
      transactionId: null,
    };
    const tx = {
      auditLog: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'log-2',
          entityType: 'importRow',
          entityId: 'row-1',
          action: 'delete',
          beforeData: deletedImportRow,
        }),
        create: vi.fn(),
        update: vi.fn(),
      },
      importRow: {
        upsert: vi.fn().mockResolvedValue(deletedImportRow),
      },
    };

    (prisma.$transaction as any).mockImplementationOnce((callback: any) => callback(tx));

    await expect(restoreTransactionFromAuditLog('log-2', { role: 'admin' }))
      .resolves
      .toEqual(deletedImportRow);

    expect(tx.importRow.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'row-1' },
      update: expect.objectContaining({ status: 'duplicate', transactionId: null }),
    }));
    expect(tx.auditLog.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        entityType: 'importRow',
        entityId: 'row-1',
        action: 'restore',
        actorRole: 'admin',
      }),
    }));
    expect(tx.auditLog.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'log-2' },
      data: { restoredAt: expect.any(Date) },
    }));
  });

  it('restores an entire latest batch inside one database transaction', async () => {
    const beforeData = {
      id: 'tx-batch-1', date: '2026-08-05', time: '', type: 'expense', category: 'Food',
      vendor: 'Store', amount: 1000, currency: 'KRW', source: 'manual', memo: null,
      hash: 'hash-batch-1', isVerified: true, isDuplicate: false, isDeleted: true, member: 'admin',
    };
    const tx = {
      auditLog: {
        findFirst: vi.fn().mockResolvedValue({ batchId: 'batch-1', createdAt: new Date() }),
        count: vi.fn().mockResolvedValue(1),
        findMany: vi.fn().mockResolvedValue([{
          id: 'log-batch-1', entityType: 'transaction', entityId: 'tx-batch-1',
          action: 'delete', batchId: 'batch-1', restoredAt: null, beforeData,
        }]),
        update: vi.fn(),
        create: vi.fn(),
      },
      transaction: { upsert: vi.fn().mockResolvedValue({ ...beforeData, isDeleted: false }) },
    };

    (prisma.$transaction as any).mockImplementationOnce((callback: any) => callback(tx));

    await expect(restoreLatestAuditBatch({ role: 'admin' })).resolves.toEqual({ count: 1 });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.auditLog.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'log-batch-1' },
      data: { restoredAt: expect.any(Date) },
    }));
  });

  it('restores only the exact audit logs requested by immediate undo', async () => {
    const beforeData = {
      id: 'tx-undo-1', date: '2026-08-05', time: '10:00', type: 'expense', category: 'Food',
      vendor: 'Store', amount: 1000, currency: 'KRW', source: 'manual', memo: null,
      hash: 'hash-undo-1', isVerified: true, isDuplicate: false, isDeleted: true, member: 'admin',
    };
    const tx = {
      auditLog: {
        findMany: vi.fn().mockResolvedValue([{
          id: 'log-undo-1', entityType: 'transaction', entityId: 'tx-undo-1',
          action: 'delete', restoredAt: null, beforeData,
        }]),
        update: vi.fn(),
        create: vi.fn(),
      },
      transaction: { upsert: vi.fn().mockResolvedValue({ ...beforeData, isDeleted: false }) },
    };

    (prisma.$transaction as any).mockImplementationOnce((callback: any) => callback(tx));

    await expect(restoreAuditLogs(['log-undo-1'], { role: 'admin' }))
      .resolves
      .toEqual({ count: 1, restoredAsset: false });
    expect(tx.auditLog.findMany).toHaveBeenCalledWith({ where: { id: { in: ['log-undo-1'] } } });
    expect(tx.transaction.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'tx-undo-1' },
      update: expect.objectContaining({ isDeleted: false }),
    }));
  });
});
