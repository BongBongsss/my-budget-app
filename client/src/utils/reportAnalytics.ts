import type { CategoryItem, Transaction } from '../api';
import { getGroupName } from './categoryUtils';
import { groups, totals } from './report';

export const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
export function shiftPeriod(year: number, month: number, mode: 'month' | 'year', step: number) {
  const date = mode === 'month' ? new Date(year, month - 1 + step, 1) : new Date(year + step, month - 1, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}
export function monthlyHistory(approved: Transaction[], end: Date, count: number, group: string | null, categories: CategoryItem[]) {
  return Array.from({ length: count }, (_, index) => {
    const key = monthKey(new Date(end.getFullYear(), end.getMonth() - count + 1 + index, 1));
    const monthRows = approved.filter(t => t.date.slice(0, 7) === key);
    const filtered = group === null ? monthRows : monthRows.filter(t => getGroupName(t.category, categories) === group);
    return { key, hasData: monthRows.length > 0, ...totals(filtered) };
  });
}
export function patternInsight(approved: Transaction[], scoped: Transaction[], end: Date, categories: CategoryItem[]) {
  const history = monthlyHistory(approved, end, 4, null, categories);
  if (history.some(m => !m.hasData) || scoped.some(t => t.isVerified === false && history.some(m => t.date.slice(0, 7) === m.key))) return null;
  const current = approved.filter(t => t.type === 'expense' && t.date.slice(0, 7) === history[3].key);
  const prior = approved.filter(t => t.type === 'expense' && history.slice(0, 3).some(m => t.date.slice(0, 7) === m.key));
  const currentGroups = groups(current, t => getGroupName(t.category, categories));
  const priorGroups = groups(prior, t => getGroupName(t.category, categories));
  const items = currentGroups.map(g => ({ name: g.name, amount: g.expense, average: (priorGroups.find(p => p.name === g.name)?.expense || 0) / 3 })).filter(g => g.average > 0 && g.amount > g.average).sort((a, b) => (b.amount - b.average) - (a.amount - a.average));
  return { period: history[3].key, start: history[0].key, end: history[2].key, item: items[0] || null };
}
