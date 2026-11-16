# LOG

## [2026-11-16] — D2. Codex 규칙 문서 예외 정정

- 태그: [docs]
- 상태: 완료
- 변경 파일: `AGENTS.md`, `docs/TRD.md`, `docs/PLAN.md`, `docs/LOG.md`
- 착수 배경: Claude용 규칙 문서 이름을 Codex의 프로젝트 지침 파일에 맞춘다.
- `docs/PRD.md`: 해당 없음 — 제품 요구사항은 바뀌지 않는다.
- `docs/TRD.md`: 변경 예정 — 규칙 문서 수정 예외의 대상을 명시한다.
- `docs/PLAN.md`: 변경 예정 — Codex 지침 적용 항목을 추가한다.
- `docs/LOG.md`: 변경 예정 — 착수 및 결과를 기록한다.
- 실제 결과: 규칙 문서 수정 예외의 `CLAUDE.md`를 `AGENTS.md`로 정정했다. 다른 Claude 전용 표현은 발견되지 않았다.
- 검증: `npm.cmd run verify` 통과 (서버 63개 통과·4개 건너뜀, 클라이언트 23개 통과, 빌드 통과).

## [2026-11-16] — D1. 프로젝트 작업 지침 도입

- 태그: [docs]
- 상태: 완료
- 변경 파일: `AGENTS.md`, `docs/PRD.md`, `docs/TRD.md`, `docs/PLAN.md`, `docs/LOG.md`
- 착수 배경: 사용자가 제공한 작업 규칙을 Codex 프로젝트 지침으로 설정한다. 기존 `docs/`가 없어 기록 문서 틀을 함께 마련한다.
- `docs/PRD.md`: 변경 예정 — 작업 절차의 도입 범위를 기록한다.
- `docs/TRD.md`: 변경 예정 — 지침과 기록 문서의 위치를 기록한다.
- `docs/PLAN.md`: 변경 예정 — 지침 도입 항목을 추가한다.
- `docs/LOG.md`: 변경 예정 — 착수 및 결과를 기록한다.
- 실제 결과: 제공된 규칙을 루트 지침으로 작성하고 누락된 기록 문서 네 개의 틀을 만들었다.
- 검증: `npm.cmd run verify` 통과 (서버 63개 통과·4개 건너뜀, 클라이언트 23개 통과, 빌드 통과).
