# CODEX.md

Project-specific guidance for Codex when working in this repository.

These instructions complement the repository documentation and the user's current request. They do not override system, developer, or explicit user instructions.

## Project References

Before making non-trivial changes, check the relevant project documents:

- Server architecture: `server/ARCHITECTURE.md`
- Client architecture: `client/ARCHITECTURE.md`
- Server testing policy: `server/TESTING_POLICY.md`
- Client testing policy: `client/TESTING_POLICY.md`
- Server data integrity rules: `server/DATA_INTEGRITY.md`
- Client data integrity rules: `client/DATA_INTEGRITY.md`
- Server error handling: `server/ERROR_HANDLING.md`
- Client error handling: `client/ERROR_HANDLING.md`

## Working Principles

- Keep changes surgical. Touch only files needed for the user's request.
- Do not refactor adjacent code unless it is required to complete the task safely.
- Match existing project patterns before introducing new abstractions.
- Explain assumptions and tradeoffs when they affect behavior, deployment, or data.
- Preserve user changes. Do not revert dirty worktree changes unless the user explicitly asks.
- Do not expose secrets from `.env` files. Mention only whether a value exists or which variable name is relevant.

## Environment Notes

- The local development environment is Windows.
- Deployment may run on Linux, so keep path casing consistent and avoid Windows-only assumptions in application code.
- The server currently uses a local Windows workaround in its dev script:
  - `npm run dev --workspace=server`
  - This may use `npx -y node@20 ...` to avoid Windows TLS issues.
- Treat `server/package.json`, root `package-lock.json`, and platform-specific dependencies as deployment-sensitive.
- If changing package files, explain why and run install/build validation where practical.

## Database And Data Integrity

- Never print the full `DATABASE_URL` or other secrets.
- Prefer soft delete for user data where the schema supports it.
- For transaction changes, preserve auditability:
  - create/update/delete actions should be logged when the audit log feature is involved.
  - destructive or irreversible data operations require explicit user approval.
- Use Prisma transactions when data changes and log writes must succeed or fail together.

## Verification Commands

Use the smallest verification set that matches the change. For broad backend/frontend changes, run:

```powershell
npx tsc --noEmit --project server/tsconfig.json
npm test --workspace=server -- --run
npm run build --workspace=client
npx prisma validate --schema prisma/schema.prisma
```

Run Prisma commands from `server/` when they need `server/.env`:

```powershell
cd server
npx prisma validate --schema prisma/schema.prisma
npx prisma generate --schema prisma/schema.prisma
```

For local runtime checks:

```powershell
npm run dev --workspace=server
npm run dev --workspace=client
```

Local URLs:

- Client: `http://localhost:3000/`
- API health: `http://localhost:5000/api/health`

## Documentation Changes

When modifying `.md` files, add or update a revision history section at the end of the edited file.

The revision history should include:

- date
- what changed
- why it changed

Prefer English for technical body content. Korean is acceptable for revision history or user-facing project notes when it improves clarity for the owner.

---

## 개정 이력 (Revision History)

- **2026-06-02**: Created Codex-specific guidance based on `GEMINI.md`.
  - **사유**: Codex 작업 시 프로젝트 문서 참조, Windows 로컬 환경, 배포 민감 파일, DB/감사 로그 검증 기준을 명확히 하기 위해 추가함.
