# Database baseline

## Why this exists

The original Prisma migrations were incremental patches for an already-running
database. Their checksums are preserved for safety, but they cannot construct a
brand-new database on their own. The current schema is captured in
`server/prisma/baseline/20260813_initial_schema.sql`.

## New local database bootstrap

Create an empty PostgreSQL database whose name starts with `budget_bootstrap_`,
then run from `server/`:

```powershell
./scripts/bootstrapEmptyLocalDb.ps1 -DatabaseUrl 'postgresql://postgres:postgres@localhost:5432/budget_bootstrap_example'
```

The script only accepts local hosts and `budget_bootstrap_*` database names. It
applies the baseline, records the preserved legacy migrations as already
applied, and runs `prisma migrate deploy`. Start the server once afterward to
seed initial passwords and runtime-only indexes.

## Future schema changes

1. Change `server/prisma/schema.prisma`.
2. Create a new migration with `npx prisma migrate dev --name <change>` against
   a disposable local database.
3. Run `npm run verify` and a blank-database bootstrap check.
4. Deploy the new migration normally. Do not edit existing migration files.

## Validation completed on 2026-08-13

- Current local schema and Prisma schema: no difference.
- Baseline SQL applied to a blank PostgreSQL database successfully.
- Blank database and Prisma schema: no difference.
- Server initialization completed successfully after baseline application.
