import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

type RequestWithId = Request & { requestId?: string };

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = (req as RequestWithId).requestId || 'unknown';
  const isKnownError = err instanceof AppError;
  const status = isKnownError ? err.status : 500;
  const code = isKnownError ? err.code : 'INTERNAL_SERVER_ERROR';
  const isProduction = process.env.NODE_ENV === 'production';

  console.error(JSON.stringify({
    level: 'error',
    requestId,
    method: req.method,
    path: req.originalUrl,
    status,
    code,
    error: err.name,
    message: isKnownError || !isProduction ? err.message : 'Internal server error',
    ...(isProduction || !err.stack ? {} : { stack: err.stack }),
  }));

  if (isKnownError) {
    return res.status(err.status).json({
      status: err.status,
      code: err.code,
      message: err.message,
      requestId,
    });
  }

  return res.status(500).json({
    status: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: isProduction ? 'An unexpected error occurred' : err.message,
    requestId,
  });
};
