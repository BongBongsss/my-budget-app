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

## 5. Pre-Push Validation
- **Local Type Check:** Run `npx tsc --noEmit` before every push to ensure zero type errors.
- **Compiler Warnings:** Treat compiler warnings and deprecation notices (e.g., TS5107) as errors that must be resolved to maintain long-term stability.

---

## 개정 이력 (Revision History)

- **2026-05-14**: "5. Pre-Push Validation" 섹션 추가.
  - **사유**: 개발 단계에서 인지하지 못한 타입 에러 및 컴파일러 경고가 배포 빌드 실패로 이어지는 것을 방지하기 위해 로컬 사전 검증 절차를 의무화함.
