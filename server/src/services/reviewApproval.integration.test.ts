import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';

const database = vi.hoisted(() => ({ client: null as unknown as import('@prisma/client').PrismaClient }));
vi.mock('../db', () => ({ get default() { return database.client; } }));

import { getAllTransactions, updateTransaction, verifyTransactions } from './transactionService';
import { createBulkReviewRequests, createReviewRequest, deleteReviewRequest, listReviewRequests, updateReviewRequestStatus } from './reviewRequestService';

const testUrl = process.env.BUDGET_TEST_DATABASE_URL;
// Opt-in only: each run creates and drops its own schema on a loopback PostgreSQL server.
describe.skipIf(!testUrl)('review approval with PostgreSQL', () => {
  let admin: PrismaClient;
  const schema = `budget_review_test_${randomUUID().replace(/-/g, '')}`;

  beforeAll(async () => {
    const url = new URL(testUrl!);
    if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) throw new Error('Integration tests require a local database');
    admin = new PrismaClient({ datasources: { db: { url: url.toString() } } });
    await admin.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
    url.searchParams.set('schema', schema);
    database.client = new PrismaClient({ datasources: { db: { url: url.toString() } } });
    const baseline = fs.readFileSync(path.resolve('prisma/baseline/20260813_initial_schema.sql'), 'utf8');
    for (const statement of baseline.split(';').filter((sql) => sql.trim())) {
      await database.client.$executeRawUnsafe(statement);
    }
  }, 30000);

  beforeEach(async () => {
    await database.client.reviewRequest.deleteMany();
    await database.client.importRow.deleteMany();
    await database.client.transaction.deleteMany();
    await database.client.auditLog.deleteMany();
  });

  afterAll(async () => {
    if (database.client) await database.client.$disconnect();
    if (admin) {
      if (!/^budget_review_test_[a-f0-9]{32}$/.test(schema)) throw new Error('Unsafe cleanup schema');
      await admin.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
      await admin.$disconnect();
    }
  });

  const seed = async (id: string) => {
    await database.client.importRow.create({ data: {
      id, status: 'new', date: '2026-11-04', type: 'expense', category: 'Food', vendor: id, amount: 12000,
    } });
    return Promise.all(['open', 'done'].map((status) => database.client.reviewRequest.create({ data: {
      targetType: 'importRow', targetId: id, type: 'question', title: `${id} question`, body: 'Keep this note', status,
    } })));
  };

  it('moves each batch request to its own transaction, preserving IDs, content and status', async () => {
    const original = [...await seed('row-a'), ...await seed('row-b')];
    expect(await verifyTransactions(['row-a', 'row-b', 'row-a'], { role: 'admin' })).toEqual({ count: 2 });
    for (const request of original) {
      const row = await database.client.importRow.findUniqueOrThrow({ where: { id: request.targetId! } });
      expect(await database.client.reviewRequest.findUnique({ where: { id: request.id } }))
        .toMatchObject({ ...request, updatedAt: expect.any(Date), targetType: 'transaction', targetId: row.transactionId });
      expect(await listReviewRequests({ targetType: 'importRow', targetId: row.id })).toHaveLength(2);
    }
    const transactions = await getAllTransactions();
    expect(transactions).toHaveLength(2);
    expect(transactions.every((row) => row.reviewCount === 2 && row.openReviewCount === 1 && row.reviewStatus === 'open')).toBe(true);
    await updateReviewRequestStatus(original[0].id, 'done');
    await deleteReviewRequest(original[0].id);
    expect(await database.client.reviewRequest.findUnique({ where: { id: original[0].id } })).toBeNull();
    expect(await verifyTransactions(['row-a', 'row-b'])).toEqual({ count: 0 });
    expect(await database.client.transaction.count()).toBe(2);
  });

  it('routes requests sent from an older page to the already-approved transaction', async () => {
    await seed('row-old-page');
    await verifyTransactions(['row-old-page']);
    const row = await database.client.importRow.findUniqueOrThrow({ where: { id: 'row-old-page' } });
    const request = await createReviewRequest({ targetType: 'importRow', targetId: row.id, title: 'Late question', body: 'Late note' });
    const bulk = await createBulkReviewRequests({ targets: [{ targetType: 'importRow', targetId: row.id, title: 'Bulk question' }], body: 'Bulk note' });
    expect(request).toMatchObject({ targetType: 'transaction', targetId: row.transactionId });
    expect(bulk[0]).toMatchObject({ targetType: 'transaction', targetId: row.transactionId });
  });

  it('does not duplicate a saved update or audit log when the same draft is retried', async () => {
    await seed('row-retry');
    await verifyTransactions(['row-retry']);
    const row = await database.client.importRow.findUniqueOrThrow({ where: { id: 'row-retry' } });
    const first = await updateTransaction(row.transactionId!, { memo: 'Updated memo', category: 'Food' });
    const retry = await updateTransaction(row.transactionId!, { memo: 'Updated memo', category: 'Food' });
    expect(first.auditLogIds).toHaveLength(1);
    expect(retry.auditLogIds).toEqual([]);
    expect(await database.client.transaction.count()).toBe(1);
    expect(await database.client.transaction.findUnique({ where: { id: row.transactionId! } })).toMatchObject({ memo: 'Updated memo' });
  });

  it('rolls back the entire approval when moving a request fails', async () => {
    const requests = await seed('row-rollback');
    await database.client.$executeRawUnsafe(`CREATE FUNCTION reject_review_move() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Test failure'; END; $$`);
    await database.client.$executeRawUnsafe(`CREATE TRIGGER reject_review_move BEFORE UPDATE ON "ReviewRequest" FOR EACH ROW EXECUTE FUNCTION reject_review_move()`);
    try {
      await expect(verifyTransactions(['row-rollback'])).rejects.toThrow();
      expect(await database.client.transaction.count()).toBe(0);
      expect(await database.client.auditLog.count()).toBe(0);
      expect(await database.client.importRow.findUnique({ where: { id: 'row-rollback' } })).toMatchObject({ status: 'new', transactionId: null });
      expect(await database.client.reviewRequest.findMany()).toEqual(expect.arrayContaining(requests));
    } finally {
      await database.client.$executeRawUnsafe(`DROP TRIGGER reject_review_move ON "ReviewRequest"`);
      await database.client.$executeRawUnsafe(`DROP FUNCTION reject_review_move()`);
    }
  });
});
