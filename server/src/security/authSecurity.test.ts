import { describe, expect, it } from 'vitest';
import { LoginAttemptLimiter, assertStrongPassword, assertTrustedMutationOrigin } from './authSecurity';

describe('auth security', () => {
  it('limits repeated failed logins for the same IP and account', () => {
    const limiter = new LoginAttemptLimiter();
    const now = 1_000;
    for (let attempt = 0; attempt < 5; attempt++) limiter.recordFailure('127.0.0.1', 'admin', now);

    expect(() => limiter.assertAllowed('127.0.0.1', 'admin', now)).toThrow('Too many failed login attempts');
    expect(() => limiter.assertAllowed('127.0.0.1', 'admin', now + 15 * 60 * 1000)).not.toThrow();
  });

  it('requires a trusted Origin for production mutations', () => {
    expect(() => assertTrustedMutationOrigin('POST', 'https://budget.example', ['https://budget.example'], true)).not.toThrow();
    expect(() => assertTrustedMutationOrigin('POST', 'https://attacker.example', ['https://budget.example'], true)).toThrow('Request origin is not allowed');
    expect(() => assertTrustedMutationOrigin('GET', undefined, ['https://budget.example'], true)).not.toThrow();
  });

  it('requires a practical password length', () => {
    expect(() => assertStrongPassword('short')).toThrow('at least 12');
    expect(() => assertStrongPassword('long-enough-password')).not.toThrow();
  });
});
