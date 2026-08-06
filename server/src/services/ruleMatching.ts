export const UNCATEGORIZED_CATEGORIES = new Set(['기타', 'Uncategorized', '']);

export const normalizeRuleText = (value: string | null | undefined): string =>
  (value || '').toLowerCase().replace(/\s+/g, ' ').trim();

export const isRuleMatch = (vendor: string, keyword: string): boolean => {
  const normalizedVendor = normalizeRuleText(vendor);
  const normalizedKeyword = normalizeRuleText(keyword);
  return normalizedKeyword.length > 0 && normalizedVendor.includes(normalizedKeyword);
};

/** Prefer the most specific rule so that "카카오페이" wins over "카카오". */
export const sortRulesBySpecificity = <T extends { keyword: string }>(rules: T[]): T[] =>
  [...rules].sort((left, right) => {
    const lengthDifference = normalizeRuleText(right.keyword).length - normalizeRuleText(left.keyword).length;
    return lengthDifference || normalizeRuleText(left.keyword).localeCompare(normalizeRuleText(right.keyword));
  });
