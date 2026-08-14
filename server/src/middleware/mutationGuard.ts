import type { NextFunction, Request, Response } from 'express';
import { ConflictError } from '../utils/errors';

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export const stableSerialize = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`;
  if (typeof value !== 'object') return JSON.stringify(value);

  return `{${Object.keys(value as Record<string, unknown>)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableSerialize((value as Record<string, unknown>)[key])}`)
    .join(',')}}`;
};

export const createMutationKey = (sessionId: string, method: string, url: string, body: unknown) =>
  `${sessionId}:${method.toUpperCase()}:${url}:${stableSerialize(body)}`;

export class MutationInFlightRegistry {
  private readonly keys = new Set<string>();

  tryStart(key: string) {
    if (this.keys.has(key)) return false;
    this.keys.add(key);
    return true;
  }

  finish(key: string) {
    this.keys.delete(key);
  }
}

export const createMutationGuard = (registry = new MutationInFlightRegistry()) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!WRITE_METHODS.has(req.method)) return next();

    const sessionId = (req as Request & { sessionID?: string }).sessionID;
    if (!sessionId) return next();

    const key = createMutationKey(sessionId, req.method, req.originalUrl, req.body);
    if (!registry.tryStart(key)) {
      return next(new ConflictError('같은 변경 요청을 처리 중입니다. 잠시 후 다시 시도해 주세요.', 'DUPLICATE_MUTATION_IN_PROGRESS'));
    }

    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      registry.finish(key);
    };
    res.once('finish', release);
    res.once('close', release);
    next();
  };
