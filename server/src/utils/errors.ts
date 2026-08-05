export class AppError extends Error {
  constructor(
    public message: string,
    public status: number = 500,
    public code: string = 'INTERNAL_SERVER_ERROR'
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, code: string = 'BAD_REQUEST') {
    super(message, 400, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', code: string = 'UNAUTHORIZED') {
    super(message, 401, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', code: string = 'FORBIDDEN') {
    super(message, 403, code);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Too many requests. Please try again later.', code: string = 'TOO_MANY_REQUESTS') {
    super(message, 429, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, code: string = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code: string = 'CONFLICT') {
    super(message, 409, code);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, code: string = 'DATABASE_ERROR') {
    super(message, 500, code);
  }
}
