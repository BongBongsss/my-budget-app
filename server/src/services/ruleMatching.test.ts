import { describe, expect, it } from 'vitest';
import { isRuleMatch, normalizeRuleText, sortRulesBySpecificity } from './ruleMatching';

describe('rule matching', () => {
  it('normalizes whitespace and casing without altering the merchant meaning', () => {
    expect(normalizeRuleText('  KAKAO   Pay ')).toBe('kakao pay');
  });

  it('prioritizes the more specific matching keyword', () => {
    const rules = sortRulesBySpecificity([
      { keyword: '카카오', assigned_category: '기타' },
      { keyword: '카카오페이', assigned_category: '쇼핑' },
    ]);

    expect(rules[0].keyword).toBe('카카오페이');
    expect(isRuleMatch('카카오페이 결제', rules[0].keyword)).toBe(true);
  });

  it('does not treat an empty keyword as a universal rule', () => {
    expect(isRuleMatch('어떤 거래처', '')).toBe(false);
  });
});
