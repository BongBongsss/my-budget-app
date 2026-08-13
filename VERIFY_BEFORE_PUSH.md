# Verification before push

Run the following command from the repository root before pushing a change:

```powershell
npm run verify
```

It performs Prisma schema validation, server type checking, server tests,
client tests, and a production client build. It does not modify application
data or connect to the production database.

GitHub Actions runs the same core checks on each push to `main` and pull
request. It also runs the browser login-flow test and checks the deployed API
and client on a schedule.

## Scope

- For a server-only change, still run the full command when practical.
- For a UI-only change, client tests and build are the minimum, but the full
  command remains the release gate.
- Browser E2E coverage will be extended in the dedicated E2E hardening phase.

## Revision history

- **2026-08-13**: Added the single local release-gate command and documented
  the existing CI coverage.
  - **Reason**: Make the checks already enforced by CI easy to reproduce before
    a push.
