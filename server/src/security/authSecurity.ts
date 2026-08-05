import { BadRequestError, ForbiddenError, TooManyRequestsError } from '../utils/errors';

const MAX_LOGIN_FAILURES = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 128;

type FailedAttempt = {
  count: number;
  resetAt: number;
};

export class LoginAttemptLimiter {
  private failures = new Map<string, FailedAttempt>();

  private key(ipAddress: string, username: string) {
    return `${ipAddress}:${username.trim().toLowerCase()}`;
  }

  assertAllowed(ipAddress: string, username: string, now = Date.now()) {
    const key = this.key(ipAddress, username);
    const attempt = this.failures.get(key);
    if (!attempt) return;
    if (attempt.resetAt <= now) {
      this.failures.delete(key);
      return;
    }
    if (attempt.count >= MAX_LOGIN_FAILURES) {
      throw new TooManyRequestsError('Too many failed login attempts. Please try again in 15 minutes.');
    }
  }

  recordFailure(ipAddress: string, username: string, now = Date.now()) {
    const key = this.key(ipAddress, username);
    const existing = this.failures.get(key);
    const active = existing && existing.resetAt > now ? existing : { count: 0, resetAt: now + LOGIN_WINDOW_MS };
    this.failures.set(key, { count: active.count + 1, resetAt: active.resetAt });
  }

  clear(ipAddress: string, username: string) {
    this.failures.delete(this.key(ipAddress, username));
  }
}

export const loginAttemptLimiter = new LoginAttemptLimiter();

export const assertTrustedMutationOrigin = (
  method: string,
  origin: string | undefined,
  trustedOrigins: string[],
  enforce: boolean,
) => {
  if (!enforce || ['GET', 'HEAD', 'OPTIONS'].includes(method)) return;
  if (!origin || !trustedOrigins.includes(origin)) {
    throw new ForbiddenError('Request origin is not allowed.', 'UNTRUSTED_ORIGIN');
  }
};

export const assertStrongPassword = (password: unknown) => {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    throw new BadRequestError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`, 'WEAK_PASSWORD');
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    throw new BadRequestError(`Password must be at most ${MAX_PASSWORD_LENGTH} characters long.`, 'WEAK_PASSWORD');
  }
};
