import { describe, expect, it } from 'vitest';
import type { Transaction } from '../api';
import { categoryChanges, inPeriod, reportRows, totals } from './report';

const row = (date: string, type: Transaction['type'], amount: number, extra: Partial<Transaction> = {}): Transaction => ({ date, type, amount, category: '식비', vendor: '', source: '', ...extra });
describe('리포트 집계', () => {
  it('승인된 수입·지출만 합산하고 제외 그룹을 적용한다', () => {
    const data = [row('2026-01-01', 'income', 100), row('2026-01-02', 'expense', 30), row('2026-01-03', 'expense', 90, { isVerified: false }), row('2026-01-04', 'exclude', 50)];
    expect(totals(reportRows(data, [], { income: [], expense: [] }))).toEqual({ income: 100, expense: 30 });
    expect(totals(reportRows(data, [], { income: [], expense: ['식비'] }))).toEqual({ income: 100, expense: 0 });
  });
  it('월과 연도 경계를 구분한다', () => {
    expect(inPeriod(row('2025-12-31', 'expense', 1), 2026)).toBe(false);
    expect(inPeriod(row('2026-01-01', 'expense', 1), 2026, 1)).toBe(true);
    expect(inPeriod(row('2026-02-01', 'expense', 1), 2026, 1)).toBe(false);
  });
  it('카테고리별 증가와 감소를 금액 차이 순서로 계산한다', () => {
    const current = [row('2026-02-01', 'expense', 80), row('2026-02-02', 'expense', 10, { category: '교통' })];
    const previous = [row('2026-01-01', 'expense', 30), row('2026-01-02', 'expense', 30, { category: '교통' })];
    expect(categoryChanges(current, previous, []).map(({ name, difference }) => ({ name, difference }))).toEqual([{ name: '식비', difference: 50 }, { name: '교통', difference: -20 }]);
  });
});
