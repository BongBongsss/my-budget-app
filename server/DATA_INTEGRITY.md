# Data Integrity Rules

This document defines the rules for database operations to ensure data remains consistent, accurate, and recoverable.

## 1. Atomicity (All-or-Nothing)
- **Transactions:** Any operation that affects multiple tables (e.g., creating a transaction AND updating an asset balance) **MUST** be wrapped in a Prisma transaction (`prisma.$transaction`).
- **Failure Handling:** If any part of a multi-table operation fails, the entire operation must be rolled back.

## 2. Soft Deletes (Data Preservation)
- **No Physical Deletes:** Critical entities (Transactions, Assets, Categories) **MUST NOT** be physically deleted from the database.
- **Flag Implementation:** Use a boolean flag `isDeleted` or a nullable `deletedAt` timestamp.
- **Recovery:** This ensures that accidental deletions can be reversed and audit trails remain intact.

## 3. Data Consistency & Validation
- **Single Source of Truth:** Never derive values (like asset total) client-side and send them to the server for storage. Always calculate derived values on the server based on immutable source data.
- **Constraint Enforcement:** Use Prisma schema constraints (e.g., `unique`, `default`, `foreign keys`) to prevent invalid data states at the database level.
- **Input Sanitization:** Validate all incoming data at the `Service` level before applying changes to the database.

## 4. Audit Trails
- **Timestamps:** Every table must have `createdAt` and `updatedAt` fields.
- **Traceability:** When debugging data issues, it must be possible to trace the origin of a record using these timestamps.

## 5. Idempotency (Prevention of Duplicates)
- **Import Handling:** When importing data from files, check for existing records (e.g., by matching date, amount, and description) before inserting to prevent duplicate transactions.
- **Request Handling:** Ensure that rapid retries or duplicate UI submissions do not create duplicate records.

## 6. Dependency Management
- **Version Pinning:** Core library versions (e.g., `prisma`, `@prisma/client`) must be pinned (removing the `^` or `~` prefixes) in `package.json` to ensure identical environments across development and production.
- **Independent Installation:** Each workspace component must declare its own dependencies to support isolated builds in deployment environments.
