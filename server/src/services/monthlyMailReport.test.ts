import { describe, expect, it } from 'vitest';
import { formatMonthlyMail, makeMonthlyMailReport, reportMonth, type MailRow } from './monthlyMailReport';

const row = (date: string, amount: number, type: string, category: string, member: string | null = '효'): MailRow => ({ date, amount, type, category, member });
const base = { period: '2026-10', categories: [{ name: '외식', groupName: '식비' }, { name: '제외', groupName: '회사비' }], exclusions: { income: [], expense: ['회사비'] } };

describe('월간 메일 요약', () => {
  it('승인된 거래와 통계 제외를 적용하고 전월·구성원·추세 합계를 계산한다', () => {
    const report = makeMonthlyMailReport({ ...base, rows: [row('2026-09-01', 30, 'expense', '외식'), row('2026-10-01', 100, 'income', '월급'), row('2026-10-02', 50, 'expense', '외식', '굥'), row('2026-10-03', 10, 'expense', '교통>버스', null), row('2026-10-04', 999, 'expense', '제외')], pendingDates: ['2026-10-05', '2026-09-01', ''] });
    expect(report.current).toEqual({ income: 100, expense: 60, balance: 40 });
    expect(report.previous).toEqual({ income: 0, expense: 30, balance: -30 });
    expect(report.pendingCount).toBe(1);
    expect(report.approvedCount).toBe(3);
    expect(report.changes).toEqual([{ name: '식비', difference: 20 }, { name: '교통', difference: 10 }]);
    expect(report.members.reduce((sum, member) => sum + member.expense, 0)).toBe(60);
    expect(report.history.map(item => item.period)).toEqual(['2026-08', '2026-09', '2026-10']);
    expect(report.history[0].hasData).toBe(false);
  });
  it('직전 3개월 기록과 미승인 여부가 충족될 때만 평균 비교를 제공한다', () => {
    const rows = ['2026-07', '2026-08', '2026-09'].map(month => row(`${month}-01`, 30, 'expense', '외식')).concat(row('2026-10-01', 60, 'expense', '외식'));
    expect(makeMonthlyMailReport({ ...base, rows, pendingDates: [] }).pattern).toEqual({ name: '식비', amount: 60, average: 30 });
    expect(makeMonthlyMailReport({ ...base, rows, pendingDates: ['2026-08-03'] }).pattern).toBeNull();
    expect(makeMonthlyMailReport({ ...base, rows: rows.slice(1), pendingDates: [] }).pattern).toBeNull();
  });
  it('연도 경계를 처리하고 유효하지 않은 월을 거부한다', () => {
    expect(reportMonth('2026-01', -1)).toBe('2025-12');
    expect(() => reportMonth('2026-13')).toThrow();
    expect(() => reportMonth('2026-2')).toThrow();
  });
  it('메일 본문은 입력된 카테고리를 HTML로 실행하지 않고 미승인 경고를 담는다', () => {
    const report = makeMonthlyMailReport({ ...base, categories: [{ name: 'unsafe', groupName: '<script>alert(1)</script>' }], rows: [row('2026-10-01', 10, 'expense', 'unsafe')], pendingDates: ['2026-10-01'] });
    const mail = formatMonthlyMail(report);
    expect(mail.html).toContain('미승인 거래');
    expect(mail.html).not.toContain('<script>');
    expect(mail.html).toContain('&lt;script&gt;');
    expect(mail.text).toContain('수입 − 지출');
  });
});
