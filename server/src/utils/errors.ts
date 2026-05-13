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

export class NotFoundError extends AppError {
  constructor(message: string, code: string = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, code: string = 'DATABASE_ERROR') {
    super(message, 500, code);
  }
}
