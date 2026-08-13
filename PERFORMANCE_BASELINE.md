# Transaction query performance baseline

## Measured local baseline - 2026-08-13

The local database held 4,151 transaction rows. The primary list query filters
for verified, non-deleted transactions and orders by date descending. Before
the index it used a sequential scan and in-memory sort, returning 2,105 rows
in about 5 ms.

## Index

`Transaction_active_verified_date_idx` is a PostgreSQL partial index on
`Transaction(date DESC)` where `isDeleted = false AND isVerified = true`.
It matches the primary transaction-list read path without indexing deleted or
staged rows.

The creation uses `IF NOT EXISTS`, so application startup is idempotent. This
is temporarily managed as an operational index because the current Prisma
migration history cannot yet safely model new production migrations. When the
migration baseline is rebuilt, this index must be included in that formal
migration.

## Review trigger

Re-run `EXPLAIN (ANALYZE, BUFFERS)` after material growth (for example, more
than 25,000 transaction rows) or if the list request exceeds 200 ms. Add
pagination/server-side filters before returning a very large transaction list.

## Revision history

- **2026-08-13**: Added the active verified transaction date partial index and
  recorded the measured local baseline.
  - **Reason**: Preserve list-query responsiveness as historical transactions
    accumulate.
