# Architecture Guidelines

This project follows a strict layered architecture to ensure maintainability, testability, and security.

## 1. Separation of Concerns
The project is strictly divided into two main layers:

### A. Routes (`/server/src/routes`)
- **Responsibility:** Act as the "Waiters."
- **Tasks:**
  - Handle HTTP requests and responses.
  - Extract parameters/body from `req`.
  - Perform basic validation of input format.
  - Call the appropriate `Service` method.
  - Return the final HTTP response (status codes, JSON payloads).
- **Prohibitions:**
  - **DO NOT** directly access the database (`db.ts` or Prisma client).
  - **DO NOT** implement business logic.

### B. Services (`/server/src/services`)
- **Responsibility:** Act as the "Chefs."
- **Tasks:**
  - Implement core business logic.
  - Perform all database operations (Prisma queries).
  - Centralize data validation and business rules.
- **Independence:**
  - Services must be independent of `req` and `res` objects.
  - This allows them to be reused by other interfaces (e.g., Cron jobs, CLI scripts).

## 2. Data Flow
1. **Client** -> **Routes** (Extracts input)
2. **Routes** -> **Service** (Passes cleaned data)
3. **Service** -> **Database** (Performs operations)
4. **Service** -> **Routes** (Returns results)
5. **Routes** -> **Client** (Sends HTTP response)

## 3. Benefits
- **Consistency:** Uniform error handling and data processing.
- **Reusability:** Business logic can be used in multiple contexts (API, Cron, CLI).
- **Testability:** Business logic can be unit-tested without needing a web server or DB connection.

## 4. Infrastructure & Deployment
### A. Build and Runtime Paths
- **Build Output:** Compiled code must reside in the `dist` directory.
- **Execution Path:** Execution commands must use project-root-relative paths (e.g., `node server/dist/index.js`) to ensure compatibility with various deployment environments.

### B. Environment Validation
- **Startup Checks:** The server must validate essential environment variables (`DATABASE_URL`, `ADMIN_PASSWORD`, etc.) during the bootstrap phase. 
- **Graceful Shutdown:** If critical configurations are missing, the process should log a clear error and terminate immediately to prevent unpredictable behavior.
