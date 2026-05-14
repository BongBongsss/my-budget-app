# GEMINI.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Reference:** 
- The project's technical architecture rules are defined in:
  - Server: `server/ARCHITECTURE.md`
  - Client: `client/ARCHITECTURE.md`
- The project's testing and quality assurance policies are defined in:
  - Server: `server/TESTING_POLICY.md`
  - Client: `client/TESTING_POLICY.md`
- The project's data integrity rules are defined in:
  - Server: `server/DATA_INTEGRITY.md`
  - Client: `client/DATA_INTEGRITY.md`
- The project's error handling policies are defined in:
  - Server: `server/ERROR_HANDLING.md`
  - Client: `client/ERROR_HANDLING.md`

Gemini must adhere to these principles in all code changes.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## 5. Platform Compatibility & Environment Integrity

**Technically mitigate the gap between development (Windows) and deployment (Linux) environments.**

- **OS Differences**: Adhere to case-sensitivity in file systems (Linux) and consistently use lowercase/kebab-case for file and directory paths.
- **Dependency Integrity**: When specific platform binaries (e.g., `esbuild`, `rollup`, `prisma`) are required for deployment (Vercel, Render), explicitly include them in `package.json` or pin versions to prevent environment mismatches.
- **Pre-build Validation**: Always run `npx tsc --noEmit` before every `git push` to pre-verify type-level compatibility and prevent build failures.

---

## 개정 이력 (Revision History)

- **2026-05-14**: "5. Platform Compatibility & Environment Integrity" 섹션 추가.
  - **사유**: Windows 개발 환경에서 정상 동작하던 코드가 Render/Vercel(Linux) 배포 시 Prisma 버전 불일치 및 플랫폼별 빌드 바이너리(`rollup`, `esbuild`) 누락으로 인해 반복적인 배포 실패를 겪음. 이를 시스템적으로 방지하기 위해 환경 통합 및 사전 검증 원칙을 명문화함.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
