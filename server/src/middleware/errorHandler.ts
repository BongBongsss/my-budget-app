import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[ERROR] ${err.name}: ${err.message}`);
  if (err.stack) {
    // 실무에서는 여기서 파일 로깅 등을 수행합니다.
    console.error(err.stack);
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({
      status: err.status,
      code: err.code,
      message: err.message,
    });
  }

  // 처리되지 않은 일반 에러
  return res.status(500).json({
    status: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message,
  });
};
