import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import http, { type Server } from 'http';
import { gzipSync } from 'zlib';

vi.mock('../services/transactionService', () => ({
  stageImportRows: vi.fn(),
  getAllTransactions: vi.fn(),
}));

import transactionRoutes from '../routes/transactionRoutes';
import { stageImportRows, getAllTransactions } from '../services/transactionService';
import { errorHandler } from '../middleware/errorHandler';

// Exercise the installed HTTP dependencies and real CSV upload route without a database.
describe('HTTP dependency compatibility', () => {
  let server: Server;
  let port: number;

  beforeAll(async () => {
    const app = express();
    app.use(express.json({ limit: '2mb' }));
    app.use(express.urlencoded({ limit: '64kb', extended: true }));
    app.post('/parse', (req, res) => res.json(req.body));
    app.use('/api/transactions', transactionRoutes);
    app.use(errorHandler);
    server = await new Promise<Server>((resolve) => {
      const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
    });
    port = (server.address() as { port: number }).port;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(stageImportRows).mockResolvedValue({
      batchId: '00000000-0000-4000-8000-000000000001', total: 1, newCount: 1, duplicateCount: 0, invalidCount: 0,
      replaced: { newCount: 0, duplicateCount: 0, invalidCount: 0, total: 0 },
    });
    vi.mocked(getAllTransactions).mockResolvedValue([]);
  });

  const post = (path: string, body: Buffer | string, headers: Record<string, string>) =>
    new Promise<{ status: number; body: any }>((resolve, reject) => {
      const request = http.request({
        hostname: '127.0.0.1', port, path, method: 'POST',
        headers: { ...headers, 'Content-Length': String(Buffer.byteLength(body)) },
      }, (response) => {
        const chunks: Buffer[] = [];
        response.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        response.on('end', () => resolve({
          status: response.statusCode!, body: JSON.parse(Buffer.concat(chunks).toString()),
        }));
      });
      request.on('error', reject);
      request.end(body);
    });

  it('parses JSON credentials and form fields without changing their values', async () => {
    const json = await post('/parse', JSON.stringify({ username: 'admin', password: 'test-only' }), {
      'Content-Type': 'application/json',
    });
    expect(json).toEqual({ status: 200, body: { username: 'admin', password: 'test-only' } });
    const form = await post('/parse', 'member=%ED%9A%A8&filter[category]=Food', {
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    expect(form).toEqual({ status: 200, body: { member: '효', filter: { category: 'Food' } } });
  });

  it('keeps serving requests after a compressed body with trailing garbage', async () => {
    const body = Buffer.concat([gzipSync('{"vendor":"test"}'), Buffer.from('invalid trailing bytes')]);
    await post('/parse', body, { 'Content-Type': 'application/json', 'Content-Encoding': 'gzip' });
    const next = await post('/parse', '{"ok":true}', { 'Content-Type': 'application/json' });
    expect(next).toEqual({ status: 200, body: { ok: true } });
  });

  it('uploads a CSV through the real import route and preserves Korean transaction data', async () => {
    const boundary = 'budget-test-boundary';
    const body = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="transactions.csv"\r\nContent-Type: text/csv\r\n\r\ndate,vendor,amount,source\n2026-11-04,테스트 가게,12000,카드\n\r\n--${boundary}--\r\n`;
    const response = await post('/api/transactions/import', body, {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    });
    expect(response.status).toBe(201);
    expect(response.body.summary).toMatchObject({ total: 1, newCount: 1 });
    expect(stageImportRows).toHaveBeenCalledWith([
      expect.objectContaining({ transaction: expect.objectContaining({
        date: '2026-11-04', vendor: '테스트 가게', amount: 12000, source: '카드',
      }) }),
    ], 'transactions.csv', expect.any(Object));
  });

  it('rejects an unexpected upload field without staging any data', async () => {
    const boundary = 'budget-test-boundary';
    const body = `--${boundary}\r\nContent-Disposition: form-data; name="wrong-file-field"; filename="transactions.csv"\r\nContent-Type: text/csv\r\n\r\ndate,vendor,amount\n\r\n--${boundary}--\r\n`;
    const response = await post('/api/transactions/import', body, {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    });
    expect(response.status).toBe(400);
    expect(response.body.code).toBe('INVALID_UPLOAD');
    expect(stageImportRows).not.toHaveBeenCalled();
  });

  it('reports admin-only access as forbidden rather than an expired session', async () => {
    const status = await new Promise<number>((resolve, reject) => {
      http.get({ hostname: '127.0.0.1', port, path: '/api/transactions/export' }, (response) => {
        response.resume();
        response.on('end', () => resolve(response.statusCode!));
      }).on('error', reject);
    });
    expect(status).toBe(403);
  });
});
