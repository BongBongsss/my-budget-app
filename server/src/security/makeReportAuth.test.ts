import { describe, expect, it } from 'vitest';
import { isMakeReportAuthorized } from './makeReportAuth';

describe('Make 리포트 인증', () => {
  const token = '0123456789abcdef0123456789abcdef';
  it('명시된 충분한 길이의 토큰과 정확한 Bearer 헤더만 허용한다', () => {
    expect(isMakeReportAuthorized(token, `Bearer ${token}`)).toBe(true);
    expect(isMakeReportAuthorized(undefined, `Bearer ${token}`)).toBe(false);
    expect(isMakeReportAuthorized('short', 'Bearer short')).toBe(false);
    expect(isMakeReportAuthorized(token, undefined)).toBe(false);
    expect(isMakeReportAuthorized(token, `Bearer ${token}x`)).toBe(false);
    expect(isMakeReportAuthorized(token, token)).toBe(false);
    expect(isMakeReportAuthorized(token, `Bearer ${token} `)).toBe(false);
  });
});
