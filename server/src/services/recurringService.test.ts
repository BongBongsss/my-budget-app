import { describe, expect, it, vi } from 'vitest';

vi.mock('../db', () => ({
  default: {},
}));

import { getRecurringMatchScore, getRecurringVendorLabel } from './recurringService';

describe('getRecurringVendorLabel', () => {
  it('preserves numeric-only transaction descriptions', () => {
    expect(getRecurringVendorLabel('15191035272707')).toBe('15191035272707');
  });

  it('removes changing month and reference suffixes', () => {
    expect(getRecurringVendorLabel('새마을07-030')).toBe('새마을');
    expect(getRecurringVendorLabel('새마을06-029')).toBe('새마을');
  });

  it('removes a trailing reference number from a named merchant', () => {
    expect(getRecurringVendorLabel('DB손해보험03406')).toBe('DB손해보험');
  });
});

describe('getRecurringMatchScore', () => {
  const recurring = { vendor: 'KT통신비', amount: 65000, category: '통신', member: '효', day_of_month: 25, isVariable: false };

  it('scores an exact recurring transaction high enough for automatic matching', () => {
    expect(getRecurringMatchScore(recurring, { vendor: 'KT통신비', amount: 65000, category: '통신', member: '효', date: '2026-08-25' }).score).toBe(90);
  });

  it('keeps an unrelated one-off transaction below the review threshold', () => {
    expect(getRecurringMatchScore(recurring, { vendor: '전자랜드', amount: 65000, category: '쇼핑', member: '효', date: '2026-08-25' }).score).toBeLessThan(60);
  });

  it('excludes a transaction belonging to the other member before scoring', () => {
    expect(getRecurringMatchScore(recurring, { vendor: 'KT통신비', amount: 65000, category: '통신', member: '굥', date: '2026-08-25' }).score).toBe(0);
  });
});
