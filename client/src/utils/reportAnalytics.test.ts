import { describe, expect, it } from 'vitest';
import type { Transaction } from '../api';
import { monthlyHistory, patternInsight, shiftPeriod } from './reportAnalytics';

const row = (date: string, amount: number, extra: Partial<Transaction> = {}): Transaction => ({ date, amount, type: 'expense', category: '식비', vendor: '', source: '', member: '효', ...extra });
describe('시험 리포트 분석', () => {
  it('월과 연도 이동에서 연말 경계를 처리한다', () => {
    expect(shiftPeriod(2026, 1, 'month', -1)).toEqual({ year: 2025, month: 12 });
    expect(shiftPeriod(2026, 12, 'month', 1)).toEqual({ year: 2027, month: 1 });
    expect(shiftPeriod(2026, 5, 'year', -1)).toEqual({ year: 2025, month: 5 });
  });
  it('기록 없는 달과 해당 카테고리 지출이 없는 달을 구분한다', () => {
    const result = monthlyHistory([row('2026-09-01', 100, { category: '교통' })], new Date(2026, 9, 1), 2, '식비', []);
    expect(result.map(x => [x.key, x.hasData, x.expense])).toEqual([['2026-09', true, 0], ['2026-10', false, 0]]);
  });
  it('직전 3개월 승인 기록이 모두 있고 미승인이 없을 때만 평균을 계산한다', () => {
    const rows = [row('2026-07-01', 10), row('2026-08-01', 20), row('2026-09-01', 30), row('2026-10-01', 40)];
    expect(patternInsight(rows, rows, new Date(2026, 9, 1), [])?.item).toMatchObject({ name: '식비', amount: 40, average: 20 });
    expect(patternInsight(rows.filter(t => !t.date.startsWith('2026-08')), rows, new Date(2026, 9, 1), [])).toBeNull();
    expect(patternInsight(rows, [...rows, row('2026-08-02', 1, { isVerified: false })], new Date(2026, 9, 1), [])).toBeNull();
  });
});
