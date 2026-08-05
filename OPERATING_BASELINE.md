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
- Error operations: API errors include a request ID; production error logs omit request bodies, cookies, and unknown-error stacks.

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

## Dependency Security Baseline

- Production dependency patches are locked through the root `package-lock.json`.
- The latest reviewed patch updates Axios, Multer, Express transitive parsing
  dependencies, and form-data without changing application source code.
- Import parsing uses read-excel-file for XLSX workflows and Papa Parse for CSV workflows. Legacy XLS files are
  deliberately rejected; users must save them as XLSX or CSV UTF-8 first.

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

- Server unit tests: 7 files / 29 tests passed.
- Client tests: 6 files / 12 tests passed.
- Client TypeScript check and production build passed.
- `git diff --check` passed.
- Browser E2E coverage validates the viewer login-to-dashboard flow, deletion
  followed by immediate undo, and Import-candidate approval with mocked API
  responses. It does not access production data.

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

These are deliberately deferred: they are not immediate risks for the current
single-user, free-tier operation. Revisit them when their stated trigger occurs.

1. Add temporary-database integration tests for authentication, Import approval,
   and audit restore conflict handling; add a true parallel-request test before
   relying on this service from a second client or automation.
2. Add regression coverage for multi-item bulk restore before expanding bulk
   editing features.
3. Introduce server-side pagination before transaction volume approaches
   25,000 records, API responses reach a few MB, or the initial list becomes
   noticeably slow.
4. Split `TransactionList` and `AssetManager` into focused components before
   the next substantial feature in either screen.
5. Add a database recurrence key and single-worker strategy before running
   multiple server instances or a separate scheduler.
6. Encrypt local backups before using cloud sync or sharing the PC.
7. Reduce the 13-minute health-monitor cadence if GitHub Actions or Render
   free-tier usage becomes constrained; immediate alerts remain low priority.

## Production Safety Controls

- Production state-changing API requests require the configured client Origin;
  this protects the cross-site session cookie from forged browser requests.
- Five failed login attempts for the same IP and account are limited for 15
  minutes. Successful login clears the failed-attempt record.
- New passwords must be 12 to 128 characters long.
- Import files are limited to 10 MB and 20,000 rows. The server returns a safe
  explanation instead of attempting an unbounded in-memory parse.
- Import approval atomically claims staged rows before transaction creation.
  Approval, recurring creation, cleanup reclassification, and automatic rule
  application now write audit records where they change financial data.
- Restoring an older update is refused when the record has been changed again,
  preventing an old activity-log entry from overwriting a newer edit.

## Local Full Backup

- Run `./server/scripts/create-local-backup.ps1` from the repository root.
- The command reads every actual application table in the production database
  and writes a timestamped JSON file to `server/backup/`. It does not issue
  database writes.
- The wrapper permits remote DB access only for this explicit read-only backup
  command, then restores the local process environment.
- The local PC schedules `SmartBudgetMonthlyLocalBackup` to check at 9:00 AM
  while the user is logged in. It performs one backup after the second Monday
  of each month; if Monday is missed, it retries at 9:00 AM on each later day
  until one valid backup succeeds.

## Health Monitoring

- GitHub Actions runs the `Health Monitor` workflow every 13 minutes and can
  also be started manually from the Actions tab.
- It checks both the Render API health endpoint and the Vercel client URL.
  HTTP errors, timeouts over 30 seconds, and repeated network failures mark
  the workflow as failed after two retries.
- Keep GitHub notifications enabled for workflow failures, or review the
  `Health Monitor` run history after an incident.
- Sessions are deliberately excluded because restoring browser sessions is not
  required for application recovery.
- `server/backup/` is ignored by Git and must never be committed or shared in a
  public location.

---

## Revision History

- **2026-08-05**: Completed the reliability and security hardening cycle.
  - **Scope**: Browser regression coverage, local backup/recovery procedure,
    health monitoring, mobile member-value consistency, senior code review,
    request security, Import safeguards, audit logging, and recovery conflict
    protection.
  - **Verification**: Server 29 tests, client 12 tests, browser E2E 3 tests,
    TypeScript checks, Prisma validation, production build, and dependency
    audit passed before deployment.

- **2026-08-05**: Added production safety controls for request origin, login attempts, Import limits, approval concurrency, and audit restore conflicts.
  - **Reason**: Close the operational security and data-integrity risks identified by the senior code review without changing existing transaction data.

- **2026-08-05**: Unified the member values used by the desktop filter and both transaction editors.
  - **Reason**: Prevent mobile edits from saving values that differ from the database and desktop UI (`효`, `굥`, `미지정`).

- **2026-08-05**: Expanded critical-path browser regression coverage.
  - **Reason**: Protect the deletion/undo flow and Import-candidate approval
    flow that can otherwise affect transaction data, without using production
    data during tests.

- **2026-08-05**: Strengthened scheduled API and client health monitoring.
  - **Reason**: Treat HTTP failures and prolonged outages as actionable failed checks rather than successful keep-alive requests.

- **2026-08-05**: Added a logged-in-user monthly local backup schedule with daily 9:00 AM retries after the second Monday.
  - **Reason**: Match the month-end bookkeeping workflow without storing an account password in Windows Task Scheduler.

- **2026-08-05**: Added a local full-data backup command and excluded backup files from Git tracking.
  - **Reason**: Keep a no-cost recovery copy of all application data without exposing personal financial data through the source repository.

- **2026-08-05**: Replaced the vulnerable SheetJS parser with read-excel-file and ended legacy XLS Import support.
  - **Reason**: Remove the unresolved high-severity xlsx dependency advisories while preserving CSV and XLSX Import behavior with regression coverage.

- **2026-08-05**: Added Playwright browser testing and a mocked viewer login flow to CI.
  - **Reason**: Catch regressions in the real browser startup and authentication journey before deployment.

- **2026-08-05**: Added isolated client error boundaries for charts, transactions, assets, and activity logs.
  - **Reason**: Keep the rest of the application usable when one high-risk UI section fails to render.

- **2026-08-05**: Added a pending-submit guard and regression test to manual transaction entry.
  - **Reason**: Prevent duplicate transactions when a user clicks Add again before the first request finishes.

- **2026-08-05**: Applied available production dependency security patches.
  - **Reason**: Remove the remediable Axios, Multer, body-parser, form-data, and qs advisories while isolating the unresolved xlsx replacement as a separately verified Import change.

- **2026-08-05**: Added the GitHub Actions CI verification workflow and refreshed the server test count.
  - **Reason**: Run type checks, schema validation, tests, and the production client build automatically for every pull request and push to `main`.

- **2026-08-05**: Created the operating baseline.
  - **Reason**: Establish a safe, documented starting point for reliability improvements without changing user data or visible behavior.
- **2026-08-05**: Recorded the initial client automated-test baseline.
  - **Reason**: Make core client regressions reproducible before expanding to browser-level scenarios.
- **2026-08-05**: Consolidated the shared period and member filter UI.
  - **Reason**: Keep the dashboard and transaction-list filters behaviorally and visually aligned across responsive layouts.
- **2026-08-05**: Hardened production configuration and error tracing.
  - **Reason**: Remove insecure production fallbacks, limit credentialed browser origins, and make production errors traceable without logging sensitive request data.
