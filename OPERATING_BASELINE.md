# Operating Baseline

## Purpose

This document defines the current safe operating baseline before reliability,
testing, and architecture improvements. It is not a data migration plan and
must not be used to modify, delete, or overwrite production data.

## User Data Preservation

- Existing transactions, categories, assets, import batches, sessions, and audit logs are out of scope for baseline work.
- Reliability improvements must preserve existing values and identifiers.
- Any future database migration must be additive by default (new columns,
  indexes, or tables) and must be reviewed before deployment.
- Before a change that could affect stored user data, create or confirm an
  available backup and obtain explicit approval.

## Current Functional Baseline

| Area | Required behavior to preserve |
| --- | --- |
| Authentication and roles | Admin can manage data; viewer remains read-only in both UI and API. |
| Transactions | Add, edit, soft delete, search/filter, CSV export, and bulk operations remain available. |
| Import workflow | File imports stage rows before confirmation; duplicate and invalid rows remain separated. |
| Categories and rules | Categories, grouping, categorization rules, exclusions, and payment rules remain available. |
| Recovery | Immediate undo, single audit-log restore, and latest batch restore remain available. |
| Assets | Asset add/edit/delete and history capture remain available. |
| Activity logs | Create/update/delete/restore entries remain readable and restore actions remain permission-protected. |
| Responsive UI | Any user-visible PC or mobile layout change requires user review before implementation. |

## Current Architecture Snapshot

- Client: React/Vite application. API calls are centralized in `client/src/api.ts`.
- Server: Express routes call service-layer business logic backed by Prisma/PostgreSQL.
- Deployment: Vercel hosts the client; Render hosts the API.
- Recovery/auditing: audit log records include before/after snapshots and can link bulk work with a batch identifier.

## Current Automated Coverage

Server unit coverage currently includes selected transaction, import, asset,
audit-log, authentication, and global error-handler behaviors. Client coverage
now includes category-group fallback behavior, the category deletion API
contract, and login success/failure behavior.

The following important coverage is not yet established as a repeatable suite:

- Additional client component and user-flow tests, especially transaction
  creation, editing, filtering, and restore feedback.
- Browser-level PC/mobile regression checks.
- Full API integration tests for role enforcement and import-to-confirmation flows.
- A single pre-deployment command that runs every required verification.

## Verification Baseline

Before a reliability change is deployed, run the smallest relevant set from:

```powershell
npx tsc --noEmit -p client/tsconfig.json
npm run build --prefix client
npm test --workspace=client
npm test --prefix server -- --run
git diff --check
```

Baseline verification completed on 2026-08-05:

- Server unit tests: 6 files / 19 tests passed.
- Client tests: 3 files / 7 tests passed.
- Client TypeScript check and production build passed.
- `git diff --check` passed.

For data-affecting work, also verify the relevant scenarios in
`VERIFICATION_SCENARIOS_2026-06-05.md`. The hard-coded record counts in that
file are historical examples only and must be refreshed from the current
environment before they are used as acceptance criteria.

## Change Gate

Before implementing a non-trivial change:

1. Inspect the active code path, data model, and test coverage.
2. Record the concrete cause or requirement and the proposed scope.
3. State whether user-visible UI, API behavior, data, or deployment settings
   could change.
4. Obtain confirmation before any user-visible or data-affecting change.
5. Implement, verify, and report the result with the exact commit.

## Next Reliability Work

1. Audit transaction/batch restore atomicity and document any gaps.
2. Add focused regression tests for undo, audit restore, and bulk restore.
3. Add a small critical-path browser test suite.
4. Add structured request/error logging without exposing sensitive data.

---

## Revision History

- **2026-08-05**: Created the operating baseline.
  - **Reason**: Establish a safe, documented starting point for reliability improvements without changing user data or visible behavior.
- **2026-08-05**: Recorded the initial client automated-test baseline.
  - **Reason**: Make core client regressions reproducible before expanding to browser-level scenarios.
