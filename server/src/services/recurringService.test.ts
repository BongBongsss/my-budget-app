import { describe, expect, it, vi } from 'vitest';

vi.mock('../db', () => ({
  default: {},
}));

import { getRecurringVendorLabel } from './recurringService';

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
