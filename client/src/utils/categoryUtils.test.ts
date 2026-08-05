import { describe, expect, it } from 'vitest';
import type { CategoryItem } from '../api';
import { getCategoryToGroupMap, getGroupName } from './categoryUtils';

const categories: CategoryItem[] = [
  { id: 'income-salary', name: 'Salary', groupName: 'Income' },
  { id: 'food', name: 'Food > Dining' },
  { id: 'misc', name: 'Miscellaneous' },
];

describe('category grouping', () => {
  it('uses the explicitly configured group when it exists', () => {
    expect(getGroupName('Salary', categories)).toBe('Income');
  });

  it('uses the prefix before a separator when no group is configured', () => {
    expect(getGroupName('Food > Dining', categories)).toBe('Food');
  });

  it('keeps an ungrouped category name intact instead of inventing a new category', () => {
    expect(getGroupName('Miscellaneous', categories)).toBe('Miscellaneous');
  });

  it('builds a stable lookup map for configured and fallback groups', () => {
    expect(getCategoryToGroupMap(categories)).toEqual({
      Salary: 'Income',
      'Food > Dining': 'Food',
      Miscellaneous: 'Miscellaneous',
    });
  });
});
