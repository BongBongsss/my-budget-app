# Senior Code Review — 2026-08-05

## Scope and Method

Reviewed the production server bootstrap, authentication/session boundaries,
transaction and audit services, Import path, recurring processing, Prisma
schema, client mutation handlers, automated tests, CI, backup, and health
monitoring configuration.

This review distinguishes risks that must be fixed before treating the service
as operationally safe from improvements that are reasonable to defer for a
single-user, free-tier budget application.

## Must Fix Now

### 1. Cross-site requests can use an authenticated session (CSRF)

- **Evidence:** Production session cookies use `SameSite=None` because the
  Vercel client and Render API are separate sites. The server accepts URL
  encoded request bodies and only uses CORS to restrict browser JavaScript.
  CORS does not stop a malicious external HTML form from sending a state
  changing request with the user's cookie.
- **Risk:** While an admin is signed in, another site could trigger actions
  such as logout or an authenticated mutation. Financial records must not rely
  on CORS as CSRF protection.
- **Required correction:** Reject state-changing browser requests whose
  `Origin` does not match `CLIENT_ORIGIN`, and add regression coverage. Keep
  the health endpoint and non-browser API tooling explicitly scoped.

### 2. Login is not throttled and password changes have no strength rule

- **Evidence:** `/api/login` performs unrestricted bcrypt comparisons for two
  known account names. `/api/change-password` accepts any non-empty password.
- **Risk:** Password guessing can consume the small free-tier server's CPU and
  an easily chosen replacement password weakens access to financial data.
- **Required correction:** Add a conservative login limit per client IP and
  account, return a clear retry response, and require a minimum password
  length. This can use an in-memory limiter for the current one-instance
  deployment; revisit persistent limiting before horizontal scaling.

### 3. Import approval is not concurrency-safe and is missing an audit event

- **Evidence:** `verifyTransactions` reads active Import rows and then creates
  transactions before marking rows committed. Two concurrent requests can read
  the same `new` row and create two transactions. The client approval handler
  has no pending-request guard. The `ImportRow.transactionId` field is not
  unique, and approval creates no audit record.
- **Risk:** A double click, retry, or overlapping request can create duplicate
  confirmed transactions. The activity log then cannot explain the approval
  that caused them.
- **Required correction:** Atomically claim each Import row before creating a
  transaction (with a database constraint/conditional update), make the UI
  approval action pending-safe, and write one auditable approval/creation
  record inside the same database transaction.

### 4. Bulk maintenance and audit restore can silently overwrite data

- **Evidence:** `cleanupTransactions` and `applyAutoRulesToExisting` perform
  multiple updates outside a database transaction and create no audit logs.
  `restoreUpdateFromAuditLog` restores recorded fields without checking whether
  the record has changed since that log was created.
- **Risk:** A failure partway through maintenance leaves a partially changed
  data set with no batch undo. Restoring an older activity entry can overwrite
  a more recent intentional edit.
- **Required correction:** Make maintenance operations transactional, create
  batch audit logs, and add a restore conflict check that refuses a stale
  restore rather than overwriting newer fields. Record recurring transaction
  creation in the audit log as well.

### 5. Upload limits are too high for the free-tier server

- **Evidence:** JSON and URL-encoded request bodies allow 50 MB and Multer has
  no file-size, row-count, or parser-work limit. XLSX parsing expands data in
  memory.
- **Risk:** A large or malformed Import file can exhaust the Render instance
  and make the budget unavailable.
- **Required correction:** Set a small explicit file limit, enforce a maximum
  parsed row count, map Multer/parser errors to a safe user message, and test
  rejection paths. The exact limit should match the largest real bank export.

## Acceptable for Now, With a Revisit Trigger

### Full-list loading and client-side filtering

All confirmed transactions and active Import candidates are sent to the client
and review summaries are calculated for that full result. At the current scale
(about 5,000 records) this is practical. Add server-side pagination and
filtered summary queries when initial page load becomes noticeably slow, API
responses exceed a few MB, or records approach roughly 25,000.

### Large client components

`TransactionList.tsx` is about 45 KB and `AssetManager.tsx` about 22 KB, well
above the project guideline of 200 lines. This is a real maintenance cost, but
splitting them is not a data-safety emergency. Before the next substantial
transaction-list or asset feature, extract state logic into hooks and split
desktop table, mobile cards, edit form, filters, and review panel into focused
components with unchanged user behavior.

### Recurring-job idempotency under multiple server instances

Recurring creation uses a read-then-create check rather than a database unique
constraint. It is safe enough while Render runs one process, but it can create
duplicates if the service is scaled or two schedulers run. Add a unique
recurrence key and a worker/leader strategy before adding instances or a
separate background worker.

### Local backup confidentiality

The full local backup intentionally includes all application tables, including
authentication hashes, and is stored unencrypted on the local PC. This is
acceptable only while the PC account and backup directory are private. Add OS
encryption or encrypted backup archives before sharing the device or storing
backups in cloud sync.

### Monitoring cadence

The 13-minute GitHub Actions monitor is functional, but it may keep the free
Render service warm and creates thousands of scheduled workflow runs per
month. Since immediate notification is intentionally low priority, reduce it
to a less frequent operational check if free-tier usage becomes constrained.

## Test Gaps to Close With the Required Fixes

1. Origin/CSRF rejection and allowed Vercel mutation request.
2. Login throttling and password-strength validation.
3. Two simultaneous Import approvals for the same row; exactly one transaction
   and one approval audit outcome must result.
4. Stale audit restore must return a conflict and preserve newer changes.
5. Cleanup and rule-application rollback/audit behavior.
6. File and row limit rejection for CSV and XLSX.
7. Route-level authorization and Import integration tests against a temporary
   database.

## Remediation Status

- **Implemented in the follow-up safety change:** trusted-Origin checking,
  in-memory login throttling, password length validation, upload and row
  limits, atomic Import-row claiming, approval and recurring audit records,
  transactional cleanup/rule application with batch audit logs, and stale
  audit-restore conflict checks.
- **Covered by new unit tests:** login throttling/password and Origin policy,
  Import-row claim/audit behavior, Import row limit, cleanup audit batch, and
  stale audit restore conflict.
- **Still recommended:** temporary-database route integration tests and a true
  parallel-request test, because mock-based unit tests do not prove database
  lock behavior end to end.

## Verified Baseline

- Production dependency audit: no runtime vulnerabilities reported for server
  or client workspaces.
- Prisma schema validation passed.
- CI already runs server unit tests, client unit tests, production client
  build, and mocked browser flows.

## Revision History

- **2026-08-05**: Recorded remediation status after the required safety changes.
  - **Reason**: Keep the review actionable and distinguish implemented controls
    from remaining integration-test work.
- **2026-08-05**: Created the senior-level operational code review.
  - **Reason**: Prioritize concrete reliability, security, concurrency, and
    maintainability risks before further feature work.
