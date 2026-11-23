import { BadRequestError } from '../utils/errors';

export type MailRow = { date: string; amount: number; type: string; category: string; member: string | null };
export type MailCategory = { name: string; groupName: string };
export type MailExclusions = { income: string[]; expense: string[] };
export type MailReportInput = { period: string; rows: MailRow[]; pendingDates: string[]; categories: MailCategory[]; exclusions: MailExclusions };
type Total = { income: number; expense: number };

export function reportMonth(period: string, offset = 0): string {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period) || Number(period.slice(0, 4)) < 1900) throw new BadRequestError('Invalid report period.', 'INVALID_REPORT_PERIOD');
  const year = Number(period.slice(0, 4)), month = Number(period.slice(5, 7));
  const date = new Date(Date.UTC(year, month - 1 + offset, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

const total = (rows: MailRow[]): Total => rows.reduce<Total>((acc, row) => {
  if (row.type === 'income') acc.income += Number(row.amount) || 0;
  if (row.type === 'expense') acc.expense += Number(row.amount) || 0;
  return acc;
}, { income: 0, expense: 0 });

export function makeMonthlyMailReport(input: MailReportInput) {
  const { period, rows, pendingDates, categories, exclusions } = input;
  reportMonth(period);
  const groupName = (name: string) => {
    if (!name) return '기타';
    return categories.find(category => category.name === name)?.groupName || name.split('>')[0].trim() || '기타';
  };
  const approved = rows.filter(row => (row.type === 'income' || row.type === 'expense') && !exclusions[row.type].includes(groupName(row.category)));
  const forMonth = (key: string) => approved.filter(row => row.date.slice(0, 7) === key);
  const current = forMonth(period), previous = forMonth(reportMonth(period, -1));
  const grouped = (list: MailRow[]) => {
    const groups = new Map<string, number>();
    list.filter(row => row.type === 'expense').forEach(row => { const group = groupName(row.category); groups.set(group, (groups.get(group) || 0) + (Number(row.amount) || 0)); });
    return [...groups].map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount);
  };
  const currentTotal = total(current), previousTotal = total(previous);
  const currentGroups = grouped(current), previousGroups = grouped(previous);
  const changes = current.length && previous.length ? [...new Set([...currentGroups.map(g => g.name), ...previousGroups.map(g => g.name)])].map(name => ({ name, difference: (currentGroups.find(g => g.name === name)?.amount || 0) - (previousGroups.find(g => g.name === name)?.amount || 0) })).filter(g => g.difference !== 0).sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference)) : [];
  const history = [-2, -1, 0].map(offset => { const month = reportMonth(period, offset), monthRows = forMonth(month), sums = total(monthRows); return { period: month, hasData: monthRows.length > 0, ...sums, balance: sums.income - sums.expense }; });
  const fourMonths = [-3, -2, -1, 0].map(offset => reportMonth(period, offset));
  const comparable = fourMonths.every(month => forMonth(month).length > 0) && !pendingDates.some(date => fourMonths.includes(date.slice(0, 7)));
  const priorGroups = grouped(approved.filter(row => fourMonths.slice(0, 3).includes(row.date.slice(0, 7))));
  const pattern = comparable ? currentGroups.map(item => ({ name: item.name, amount: item.amount, average: (priorGroups.find(g => g.name === item.name)?.amount || 0) / 3 })).filter(item => item.average > 0 && item.amount > item.average).sort((a, b) => (b.amount - b.average) - (a.amount - a.average))[0] || null : null;
  const members = [...new Set(['효', '굥', ...current.map(row => row.member?.trim() || '미지정')])].map(name => {
    const memberRows = current.filter(row => (row.member?.trim() || '미지정') === name);
    return { name, ...total(memberRows), topExpense: grouped(memberRows)[0] || null };
  });
  return { period, pendingCount: pendingDates.filter(date => date.slice(0, 7) === period).length, approvedCount: current.length, current: { ...currentTotal, balance: currentTotal.income - currentTotal.expense }, previous: previous.length ? { ...previousTotal, balance: previousTotal.income - previousTotal.expense } : null, changes, categories: currentGroups.slice(0, 5), pattern, members, history };
}

type Report = ReturnType<typeof makeMonthlyMailReport>;
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] || char));
const money = (value: number) => `${Math.round(value).toLocaleString('ko-KR')}원`;
const signed = (value: number) => `${value > 0 ? '+' : value < 0 ? '−' : ''}${money(Math.abs(value))}`;
export function formatMonthlyMail(report: Report) {
  const { period, current, previous, changes, categories, pattern, members, history, pendingCount } = report;
  const title = `${period.slice(0, 4)}년 ${Number(period.slice(5, 7))}월`;
  const diff = previous ? current.expense - previous.expense : null;
  const headline = diff === null ? `이번 달 지출은 ${money(current.expense)}이에요.` : diff === 0 ? '지난달과 지출이 같아요.' : `지난달보다 지출이 ${money(Math.abs(diff))} ${diff > 0 ? '늘었어요' : '줄었어요'}.`;
  const warning = pendingCount ? `확인이 필요한 거래 ${pendingCount}건 · 미승인 거래는 집계에서 제외돼요. 승인 후 결과가 달라질 수 있어요.` : '승인된 거래와 통계 제외 설정을 적용했어요.';
  const changeLines = changes.slice(0, 3).map(item => `${item.name} ${signed(item.difference)}`);
  const categoryLines = categories.map(item => `${item.name} ${money(item.amount)}${current.expense > 0 ? ` · 지출의 ${(item.amount / current.expense * 100).toFixed(1)}%` : ''}`);
  const patternLine = pattern ? `${pattern.name} ${money(pattern.amount)} · 직전 3개월 평균 ${money(pattern.average)}. 최근 기록을 확인해 보세요.` : '비교할 자료가 충분하지 않거나 평균보다 높아진 항목이 없어요.';
  const memberLines = members.map(item => `${item.name} · 수입 ${money(item.income)} · 지출 ${money(item.expense)}${item.topExpense ? ` · 주요 지출 ${item.topExpense.name} ${money(item.topExpense.amount)}` : ''}`);
  const historyLines = history.map(item => item.hasData ? `${item.period} · 수입 ${money(item.income)} · 지출 ${money(item.expense)} · 차액 ${signed(item.balance)}` : `${item.period} · 데이터 없음`);
  const sections = [
    ['이번 달 한눈에', [
      `수입 ${money(current.income)}${previous ? ` · 지난달 대비 ${signed(current.income - previous.income)}` : ''}`,
      `지출 ${money(current.expense)}${previous ? ` · 지난달 대비 ${signed(current.expense - previous.expense)}` : ''}`,
      `수입 − 지출 ${signed(current.balance)}${previous ? ` · 지난달 대비 ${signed(current.balance - previous.balance)}` : ''}`,
      '차액은 자산 잔액이나 저축액과 다를 수 있어요.',
    ]],
    ['지난달과 달라진 지출', changeLines.length ? changeLines : [previous ? '변화한 카테고리가 없어요.' : '지난달 비교 자료가 없어요.']],
    ['주요 지출', categoryLines.length ? categoryLines : ['집계할 지출이 없어요.']],
    ['평소와 비교', [patternLine]], ['구성원별 요약', memberLines], ['최근 3개월', historyLines],
  ] as const;
  const link = 'https://my-budget-app-client.vercel.app/';
  const text = [`${title} 가계부 리포트`, warning, headline, ...sections.flatMap(([heading, lines]) => [heading, ...lines]), `리포트 보기: ${link}`].join('\n\n');
  const htmlSections = sections.map(([heading, lines]) => `<section style="margin:24px 0"><h2 style="font-size:18px;color:#252b43">${escapeHtml(heading)}</h2>${lines.map(line => `<p style="margin:8px 0;line-height:1.6">${escapeHtml(line)}</p>`).join('')}</section>`).join('');
  const html = `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#28324b;padding:24px"><h1 style="font-size:24px">${escapeHtml(title)} 가계부 리포트</h1><p style="padding:14px;background:#fff6e5;border-radius:10px;line-height:1.6">${escapeHtml(warning)}</p><p style="font-size:19px;font-weight:bold;color:#635cd6">${escapeHtml(headline)}</p>${htmlSections}<p><a href="${link}" style="display:inline-block;padding:12px 18px;border-radius:8px;background:#635cd6;color:#fff;text-decoration:none">리포트 자세히 보기</a></p><p style="font-size:12px;color:#738099">승인된 거래 기준이며 미승인·입력 누락에 따라 결과가 달라질 수 있어요.</p></div>`;
  const subjectChange = diff === null ? '' : diff === 0 ? ' · 지출 변동 없음' : ` · 지출 ${money(Math.abs(diff))} ${diff > 0 ? '증가' : '감소'}`;
  return { subject: `[효굥봉 가계부] ${title} 리포트${subjectChange}`, text, html, summary: report };
}
