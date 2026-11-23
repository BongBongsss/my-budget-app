import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const tx = { transaction: { findMany: vi.fn() }, importRow: { findMany: vi.fn() }, category: { findMany: vi.fn() }, $queryRaw: vi.fn() };
  return { tx, transaction: vi.fn(async (callback: (value: typeof tx) => unknown) => callback(tx)) };
});
vi.mock('../db', () => ({ default: { $transaction: mocks.transaction } }));
import { getMonthlyMailReport } from './monthlyMailReportRepository';

describe('월간 메일 데이터 조회', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.tx.transaction.findMany.mockResolvedValue([{ date: '2026-10-01', type: 'expense', amount: 100, category: '식비', member: '효' }]);
    mocks.tx.importRow.findMany.mockResolvedValue([{ date: '2026-10-03' }, { date: null }]);
    mocks.tx.category.findMany.mockResolvedValue([{ name: '식비', groupName: '생활비' }]);
    mocks.tx.$queryRaw.mockResolvedValue([{ excludedGroups: { income: [], expense: [] } }]);
  });
  it('일관된 읽기에서 승인 거래·활성 임포트 행과 통계 설정을 사용한다', async () => {
    const report = await getMonthlyMailReport('2026-10');
    expect(report.current.expense).toBe(100);
    expect(report.pendingCount).toBe(1);
    expect(report.categories[0].name).toBe('생활비');
    expect(mocks.transaction).toHaveBeenCalledWith(expect.any(Function), { isolationLevel: 'RepeatableRead' });
    expect(mocks.tx.transaction.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { isDeleted: false, isVerified: true, date: { gte: '2026-07-01', lt: '2026-11-01' } } }));
    expect(mocks.tx.importRow.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { status: { in: ['new', 'duplicate', 'invalid'] }, date: { gte: '2026-07-01', lt: '2026-11-01' } } }));
  });
  it('잘못된 통계 제외 설정을 임의로 무시하지 않는다', async () => {
    mocks.tx.$queryRaw.mockResolvedValue([{ excludedGroups: { expense: 'invalid' } }]);
    await expect(getMonthlyMailReport('2026-10')).rejects.toThrow('Invalid chart statistics settings.');
  });
});
