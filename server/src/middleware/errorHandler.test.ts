import { describe, it, expect, vi } from 'vitest';
import { errorHandler } from './errorHandler';
import { BadRequestError, AppError } from '../utils/errors';
import { Request, Response, NextFunction } from 'express';

describe('Global Error Handler Middleware', () => {
  it('AppError(BadRequestError)가 발생하면 정의된 포맷으로 응답해야 한다', () => {
    const err = new BadRequestError('Invalid input data', 'INVALID_FIELD');
    const req = { requestId: 'request-123', method: 'GET', originalUrl: '/api/test' } as unknown as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      status: 400,
      code: 'INVALID_FIELD',
      message: 'Invalid input data',
      requestId: 'request-123',
    }));
  });

  it('일반 Error가 발생하면 500 에러 포맷으로 응답해야 한다', () => {
    const err = new Error('Unexpected system crash');
    const req = { requestId: 'request-456', method: 'GET', originalUrl: '/api/test' } as unknown as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 500,
        code: 'INTERNAL_SERVER_ERROR',
        requestId: 'request-456',
      })
    );
  });
});
