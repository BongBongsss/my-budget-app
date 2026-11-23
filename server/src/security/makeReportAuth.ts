import { createHash, timingSafeEqual } from 'crypto';

export function isMakeReportAuthorized(configuredToken: string | undefined, authorization: string | undefined): boolean {
  if (!configuredToken || configuredToken.length < 32 || /\s/.test(configuredToken) || !authorization?.startsWith('Bearer ')) return false;
  const supplied = authorization.slice(7);
  if (!supplied || /\s/.test(supplied)) return false;
  const digest = (value: string) => createHash('sha256').update(value, 'utf8').digest();
  return timingSafeEqual(digest(configuredToken), digest(supplied));
}
