import express from 'express';
import type { Server } from 'http';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { errorHandler } from '../middleware/errorHandler';
import { makeMonthlyMailReport } from '../services/monthlyMailReport';

vi.mock('../services/monthlyMailReportRepository', () => ({
  getMonthlyMailReport: vi.fn(async (period: string) => makeMonthlyMailReport({ period, rows: [], pendingDates: [], categories: [], exclusions: { income: [], expense: [] } })),
}));
import makeReportRoutes from './makeReportRoutes';
import { getMonthlyMailReport } from '../services/monthlyMailReportRepository';

describe('Make 월간 리포트 API', () => {
  let server: Server;
  let url: string;
  const token = '0123456789abcdef0123456789abcdef';
  beforeAll(async () => {
    const app = express();
    app.use('/api/integrations/make', makeReportRoutes);
    app.use(errorHandler);
    await new Promise<void>((resolve, reject) => { server = app.listen(0, '127.0.0.1', error => error ? reject(error) : resolve()); });
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Test server failed');
    url = `http://127.0.0.1:${address.port}/api/integrations/make/monthly-report`;
  });
  afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });
  afterAll(async () => { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); });
  it('미설정·잘못된 토큰은 데이터를 조회하지 않는다', async () => {
    vi.stubEnv('MAKE_REPORT_TOKEN', '');
    expect((await fetch(`${url}?period=2026-10`, { headers: { Authorization: `Bearer ${token}` } })).status).toBe(401);
    vi.stubEnv('MAKE_REPORT_TOKEN', token);
    expect((await fetch(`${url}?period=2026-10`, { headers: { Authorization: 'Bearer wrong' } })).status).toBe(401);
    expect(getMonthlyMailReport).not.toHaveBeenCalled();
  });
  it('인증된 GET만 허용하고 유효한 기간의 메일을 no-store로 반환한다', async () => {
    vi.stubEnv('MAKE_REPORT_TOKEN', token);
    const headers = { Authorization: `Bearer ${token}` };
    expect((await fetch(url, { method: 'POST', headers })).status).toBe(405);
    expect((await fetch(url, { headers })).status).toBe(400);
    expect((await fetch(`${url}?period=2026-13`, { headers })).status).toBe(400);
    const response = await fetch(`${url}?period=2026-10`, { headers });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    const body = await response.json() as { subject: string; html: string; summary: { period: string } };
    expect(body.subject).toContain('2026년 10월');
    expect(body.html).toContain('수입');
    expect(body.summary.period).toBe('2026-10');
  });
});
