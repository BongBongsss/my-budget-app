import { describe, expect, it } from 'vitest';
import { createRememberSession, getRememberSessionRefresh, REMEMBER_SESSION_IDLE_MS, REMEMBER_SESSION_MAX_MS } from './rememberSession';

describe('remember session policy', () => {
  const loginAt = new Date('2026-08-13T00:00:00.000Z').getTime();

  it('extends a remembered session to 14 days from each active visit', () => {
    const state = createRememberSession(loginAt);
    expect(getRememberSessionRefresh(state, loginAt + 24 * 60 * 60 * 1000)).toEqual({ active: true, maxAge: REMEMBER_SESSION_IDLE_MS });
  });

  it('shortens the final refresh to the remaining maximum lifetime', () => {
    const state = createRememberSession(loginAt);
    expect(getRememberSessionRefresh(state, loginAt + REMEMBER_SESSION_MAX_MS - 3 * 24 * 60 * 60 * 1000)).toEqual({ active: true, maxAge: 3 * 24 * 60 * 60 * 1000 });
  });

  it('expires after the 60-day absolute lifetime', () => {
    const state = createRememberSession(loginAt);
    expect(getRememberSessionRefresh(state, loginAt + REMEMBER_SESSION_MAX_MS)).toEqual({ active: false, expired: true });
  });
});
