# Error Handling Policy

To ensure consistent API communication and efficient debugging, this project follows a centralized error handling strategy.

## 1. Standard Error Format
All API errors must return the following JSON structure to ensure client-side predictability:
```json
{
  "status": number,
  "code": string,
  "message": string,
  "details": any (optional)
}
```

## 2. Custom Error Classes
Use domain-specific error classes instead of generic `Error` objects:
- `AppError` (Base): Extends the standard `Error` class.
- `BadRequestError` (400): Invalid user input or validation failure.
- `UnauthorizedError` (401): Authentication failure.
- `ForbiddenError` (403): Insufficient permissions.
- `NotFoundError` (404): Resource not found.
- `DatabaseError` (500): Server-side database operation failure.

## 3. Centralized Handling Logic
- **Service Layer:** Services should throw appropriate custom error classes when business rules are violated. They must NOT catch and swallow errors.
- **Router Layer:** Routers should wrap controller logic in `try-catch` blocks and pass caught errors to `next(err)`.
- **Global Middleware:** A single error-handling middleware (`app.use((err, req, res, next) => { ... })`) must be implemented to catch all errors passed via `next(err)` and send the standardized JSON response.

## 4. Logging Strategy
- **Never swallow errors:** Do not use empty `catch` blocks or `console.log` only.
- **Log levels:** Use appropriate logging levels (ERROR for system failures, WARN for input errors).
- **Security:** Do not expose raw system stack traces or sensitive database details to the client in the `message` field. Always map technical details to generic, user-friendly messages for the client.
- **Persistence:** Log full error details (including stack traces) to server logs or a logging service for diagnostic purposes.
