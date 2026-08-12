export const REMEMBER_SESSION_IDLE_MS = 14 * 24 * 60 * 60 * 1000;
export const REMEMBER_SESSION_MAX_MS = 60 * 24 * 60 * 60 * 1000;

export type RememberSessionState = {
  rememberMe?: boolean;
  rememberStartedAt?: number;
  rememberExpiresAt?: number;
};

export const createRememberSession = (now = Date.now()): Required<RememberSessionState> => ({
  rememberMe: true,
  rememberStartedAt: now,
  rememberExpiresAt: now + REMEMBER_SESSION_MAX_MS,
});

export const getRememberSessionRefresh = (state: RememberSessionState, now = Date.now()) => {
  if (!state.rememberMe || !state.rememberExpiresAt) return { active: false as const };
  if (now >= state.rememberExpiresAt) return { active: false as const, expired: true as const };
  return { active: true as const, maxAge: Math.min(REMEMBER_SESSION_IDLE_MS, state.rememberExpiresAt - now) };
};
