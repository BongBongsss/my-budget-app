import type { CategoryItem, Transaction } from '../api';
import { getGroupName } from './categoryUtils';

export type Exclusions = { income: string[]; expense: string[] };
export function reportRows(transactions: Transaction[], categories: CategoryItem[], exclusions: Exclusions) {
  return transactions.filter(t => t.isVerified !== false && (t.type === 'income' || t.type === 'expense') && !exclusions[t.type].includes(getGroupName(t.category, categories)));
}
export function inPeriod(t: Transaction, year: number, month?: number) {
  return t.date.slice(0, 4) === String(year) && (month === undefined || t.date.slice(5, 7) === String(month).padStart(2, '0'));
}
export function totals(rows: Transaction[]) {
  return rows.reduce((sum, t) => { if (t.type === 'income') sum.income += Number(t.amount) || 0; if (t.type === 'expense') sum.expense += Number(t.amount) || 0; return sum; }, { income: 0, expense: 0 });
}
export function groups(rows: Transaction[], key: (t: Transaction) => string) {
  const result = new Map<string, Transaction[]>();
  rows.forEach(t => { const name = key(t); result.set(name, [...(result.get(name) || []), t]); });
  return [...result].map(([name, items]) => ({ name, ...totals(items) })).sort((a, b) => b.expense - a.expense);
}

export function categoryChanges(current: Transaction[], previous: Transaction[], categories: CategoryItem[]) {
  const key = (t: Transaction) => getGroupName(t.category, categories);
  const currentGroups = groups(current.filter(t => t.type === 'expense'), key);
  const previousGroups = groups(previous.filter(t => t.type === 'expense'), key);
  const names = new Set([...currentGroups.map(g => g.name), ...previousGroups.map(g => g.name)]);
  return [...names].map(name => {
    const amount = currentGroups.find(g => g.name === name)?.expense || 0;
    const before = previousGroups.find(g => g.name === name)?.expense || 0;
    return { name, amount, before, difference: amount - before };
  }).filter(g => g.difference !== 0).sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
}
