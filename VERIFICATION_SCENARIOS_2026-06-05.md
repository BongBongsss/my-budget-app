# 변경 검증 시나리오 - 2026-06-05

> 목적: 로컬에서 변경된 DB 구조, import staging 흐름, 감사 로그, 로컬/Neon 분리 상태를 운영 반영 전에 확인한다.

## 0. 사전 조건

- 로컬 PostgreSQL 서비스가 실행 중이어야 한다.
  - 서비스명: `postgresql-x64-18`
- 로컬 DB는 `budget_dev`를 사용한다.
- 로컬 백엔드는 Neon이 아니라 `server/.env.local`의 DB URL을 사용해야 한다.
- 로컬 프론트는 `VITE_API_BASE=http://localhost:5000/api`를 사용해야 한다.
- 로그인 비밀번호는 로컬에 복원된 Neon 덤프의 기존 비밀번호를 사용한다.

확인 명령:

```powershell
Get-ChildItem -Force server | Where-Object { $_.Name -like '.env*' }
Invoke-WebRequest -Uri http://localhost:5000/api/health -UseBasicParsing
Invoke-WebRequest -Uri http://127.0.0.1:3000 -UseBasicParsing
```

기대 결과:

- `server/.env.local`이 존재한다.
- 백엔드 health가 `200`을 반환한다.
- 프론트가 `200`을 반환한다.

## 1. 로컬/Neon 분리 검증

목적: 로컬 개발 서버가 실수로 Neon 운영 DB를 보지 않는지 확인한다.

절차:

1. `server/.env.local`을 확인한다.
2. `DATABASE_URL`이 `localhost:5432/budget_dev`인지 확인한다.
3. 백엔드를 실행한다.

```powershell
cd server
npm run dev:system-node
```

기대 결과:

- 서버가 정상 시작된다.
- 로그에 Neon 호스트명이 나오지 않는다.
- `http://localhost:5000/api/health`가 `200`을 반환한다.

추가 확인:

```powershell
$env:PGPASSWORD='postgres'
'SELECT current_database();' | & 'C:\Program Files\PostgreSQL\18\bin\psql.exe' -h localhost -U postgres -p 5432 -d budget_dev -w
```

기대 결과:

- `current_database`가 `budget_dev`이다.

## 2. 로그인 및 권한 검증

목적: 복원된 `Auth` 테이블 기준으로 로그인과 권한 분기가 정상인지 확인한다.

절차:

1. `http://127.0.0.1:3000` 접속.
2. 기존 운영 관리자 비밀번호로 `admin` 로그인.
3. 로그아웃.
4. 잘못된 비밀번호로 로그인 시도.

기대 결과:

- 기존 관리자 비밀번호는 로그인 성공.
- 잘못된 비밀번호는 로그인 실패.
- 로그인 전 `/api/auth-status`의 `401`은 정상이다.
- 로그인 후 거래 목록, 자산, 감사 로그 화면 접근이 가능하다.

API 확인:

```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/auth-status -UseBasicParsing
```

주의:

- 로그인 전 `401 Unauthorized`는 오류가 아니라 정상 상태이다.

## 3. 기본 데이터 개수 검증

목적: 로컬 복원 데이터와 화면 카운트가 기대값과 맞는지 확인한다.

DB 확인:

```powershell
$env:PGPASSWORD='postgres'
'SELECT count(*) AS total FROM "Transaction";' | & 'C:\Program Files\PostgreSQL\18\bin\psql.exe' -h localhost -U postgres -p 5432 -d budget_dev -w
'SELECT "isDeleted", "isVerified", "isDuplicate", count(*) FROM "Transaction" GROUP BY "isDeleted", "isVerified", "isDuplicate" ORDER BY "isDeleted", "isVerified", "isDuplicate";' | & 'C:\Program Files\PostgreSQL\18\bin\psql.exe' -h localhost -U postgres -p 5432 -d budget_dev -w
'SELECT status, count(*) FROM "ImportRow" GROUP BY status ORDER BY status;' | & 'C:\Program Files\PostgreSQL\18\bin\psql.exe' -h localhost -U postgres -p 5432 -d budget_dev -w
```

현재 기대값:

- `"Transaction"` 전체: `2545`
- 화면 "전체" 대상: `isDeleted=false`, `isVerified=true`, `isDuplicate=false` = `921`
- `"ImportRow"`:
  - `new`: `133`
  - `duplicate`: `1`
  - `invalid`: `2`
  - `ignored`: `4697`
  - `committed`: `1`

화면 기대값:

- 전체 탭: `921`
- 신규 탭: `133`
- 중복 탭: `1`
- 무효 탭: `2`

## 4. 거래 목록 필터/탭 검증

목적: 기존 거래와 import staging 거래가 화면에서 올바른 탭으로 분리되는지 확인한다.

절차:

1. 전체 탭을 연다.
2. 신규 탭을 연다.
3. 중복 탭을 연다.
4. 무효 탭을 연다.
5. 기간 필터를 `전체`, `월별`, `연별`로 바꾼다.
6. 상위 그룹, 대분류, 소분류, 내용, 결제수단, 메모 검색을 각각 확인한다.

기대 결과:

- 전체 탭에는 검증 완료 거래만 보인다.
- 신규/중복/무효 탭에는 `ImportRow` 기반 미검증 항목만 보인다.
- 기간 필터는 전체 탭의 검증 완료 거래에 적용된다.
- 검색/필터 적용 후 페이지네이션과 합계가 깨지지 않는다.

## 5. 파일 import staging 검증

목적: CSV/Excel import가 곧바로 `"Transaction"`에 확정 저장되지 않고 `"ImportBatch"`/`"ImportRow"`에 staging 되는지 확인한다.

절차:

1. 테스트용 CSV 또는 Excel 파일을 준비한다.
2. 최소 3종류의 행을 포함한다.
   - 기존 거래와 같은 날짜/시간/타입/내용/금액/결제수단을 가진 중복 행
   - 새로운 정상 행
   - 필수값이 비어 있거나 금액/날짜가 이상한 무효 행
3. 파일 import를 실행한다.
4. import 결과 모달을 확인한다.
5. 신규/중복/무효 탭 카운트를 확인한다.

기대 결과:

- import 결과에 전체/신규/중복/무효 건수가 표시된다.
- 신규 행은 신규 탭에 표시된다.
- 중복 행은 중복 탭에 표시된다.
- 무효 행은 무효 탭에 표시된다.
- import 직후 검증 완료 거래 수는 바로 증가하지 않는다.

DB 확인:

```powershell
$env:PGPASSWORD='postgres'
'SELECT status, count(*) FROM "ImportRow" GROUP BY status ORDER BY status;' | & 'C:\Program Files\PostgreSQL\18\bin\psql.exe' -h localhost -U postgres -p 5432 -d budget_dev -w
'SELECT count(*) FROM "ImportBatch";' | & 'C:\Program Files\PostgreSQL\18\bin\psql.exe' -h localhost -U postgres -p 5432 -d budget_dev -w
```

## 6. 같은 파일 재-import 검증

목적: 같은 파일을 다시 import할 때 이전 미검증 목록이 무한 누적되지 않는지 확인한다.

절차:

1. 같은 파일을 한 번 import한다.
2. 신규/중복/무효 카운트를 기록한다.
3. 같은 파일을 다시 import한다.
4. 결과 모달의 `replaced` 정보와 탭 카운트를 확인한다.

기대 결과:

- 이전 미검증 목록은 `ignored`로 정리된다.
- 화면에는 이번 import 결과만 신규/중복/무효 탭에 보인다.
- 같은 파일을 여러 번 import해도 활성 신규/중복/무효 카운트가 계속 누적되지 않는다.

DB 확인:

```powershell
$env:PGPASSWORD='postgres'
'SELECT status, count(*) FROM "ImportRow" GROUP BY status ORDER BY status;' | & 'C:\Program Files\PostgreSQL\18\bin\psql.exe' -h localhost -U postgres -p 5432 -d budget_dev -w
```

## 7. 신규 거래 검증 처리

목적: 신규/중복 탭의 항목을 검증하면 `"Transaction"`에 확정 저장되고 `"ImportRow"` 상태가 변경되는지 확인한다.

절차:

1. 신규 탭에서 1개 항목을 선택한다.
2. 검증 버튼을 누른다.
3. 전체 탭으로 이동한다.
4. 방금 검증한 거래가 전체 탭에 표시되는지 확인한다.

기대 결과:

- 신규 탭 카운트가 1 감소한다.
- 전체 탭 카운트가 1 증가한다.
- `"Transaction"`에 검증 완료 거래가 생성된다.
- 해당 `"ImportRow"`는 `committed` 상태가 된다.

DB 확인:

```powershell
$env:PGPASSWORD='postgres'
'SELECT status, count(*) FROM "ImportRow" GROUP BY status ORDER BY status;' | & 'C:\Program Files\PostgreSQL\18\bin\psql.exe' -h localhost -U postgres -p 5432 -d budget_dev -w
'SELECT count(*) FROM "Transaction" WHERE "isDeleted" = false AND "isVerified" = true;' | & 'C:\Program Files\PostgreSQL\18\bin\psql.exe' -h localhost -U postgres -p 5432 -d budget_dev -w
```

## 8. 무효 거래 처리 검증

목적: 무효 import 행이 검증 완료 거래로 잘못 들어가지 않는지 확인한다.

절차:

1. 무효 탭을 연다.
2. 무효 사유가 화면에 보이는지 확인한다.
3. 무효 항목을 검증하거나 수정할 수 있는 UI가 있다면 유효값으로 수정 후 검증한다.

기대 결과:

- 무효 행은 기본적으로 전체 탭에 보이지 않는다.
- 무효 사유가 확인 가능하다.
- 유효값으로 수정 후 검증하는 흐름이 있다면 `"Transaction"` 확정 저장이 정상 동작한다.

## 9. 거래 수정 및 일괄 수정 검증

목적: 기존 거래와 import staging 거래의 수정 동작이 기대대로 분기되는지 확인한다.

절차:

1. 전체 탭에서 기존 거래 1개를 수정한다.
   - 대분류
   - 소분류
   - 메모
   - 구성원
2. 신규 탭에서 미검증 거래 1개를 수정한다.
3. 여러 항목을 선택해 일괄 수정한다.

기대 결과:

- 기존 거래 수정은 `"Transaction"`에 반영된다.
- 미검증 거래 수정은 `"ImportRow"`에 반영된다.
- 화면 새로고침 후에도 수정값이 유지된다.
- 수정 감사 로그가 생성된다.

감사 로그 확인:

```powershell
$env:PGPASSWORD='postgres'
'SELECT "entityType", action, count(*) FROM "AuditLog" GROUP BY "entityType", action ORDER BY "entityType", action;' | & 'C:\Program Files\PostgreSQL\18\bin\psql.exe' -h localhost -U postgres -p 5432 -d budget_dev -w
```

## 10. 삭제, 일괄 삭제, 복구 검증

목적: 삭제가 물리 삭제가 아니라 상태 변경/감사 로그 기반으로 안전하게 동작하는지 확인한다.

절차:

1. 전체 탭에서 기존 거래 1개를 삭제한다.
2. 신규 탭에서 미검증 import 행 1개를 삭제한다.
3. 여러 항목을 선택해 일괄 삭제한다.
4. 감사 로그 화면으로 이동한다.
5. 삭제 로그에서 복구를 실행한다.

기대 결과:

- 기존 거래 삭제 시 `"Transaction"."isDeleted"`가 `true`가 된다.
- import 행 삭제 시 `"ImportRow"`가 복구 가능한 방식으로 처리된다.
- 삭제 감사 로그가 생성된다.
- 복구 후 해당 항목이 원래 탭에 다시 보인다.
- 이미 복구한 로그는 다시 복구 가능 상태로 남지 않는다.

## 11. 감사 로그 목록 검증

목적: 생성/수정/삭제/복구 로그가 조회, 필터, 페이지네이션에서 정상인지 확인한다.

절차:

1. 감사 로그 화면을 연다.
2. action 필터를 `create`, `update`, `delete`, `restore`로 각각 확인한다.
3. entity type 필터를 확인한다.
4. 페이지 크기와 페이지 이동을 확인한다.

기대 결과:

- 최신 로그가 위에 표시된다.
- 필터 적용 시 총 개수와 페이지 수가 맞다.
- 복구 가능한 삭제 로그만 복구 버튼이 보인다.

## 12. 자산 화면 회귀 검증

목적: 거래/import 변경으로 기존 자산 기능이 깨지지 않았는지 확인한다.

절차:

1. 자산 관리 화면을 연다.
2. 자산 추가/수정/삭제를 각각 확인한다.
3. 자산 히스토리 저장 기능을 확인한다.

기대 결과:

- 자산 목록이 정상 로드된다.
- 변경 후 새로고침해도 데이터가 유지된다.
- 감사 로그 또는 관련 기록이 기대대로 남는다.

## 13. viewer 권한 검증

목적: 조회 전용 계정에서 쓰기 작업이 차단되는지 확인한다.

절차:

1. viewer 계정으로 로그인한다.
2. 거래 추가/수정/삭제/import/검증 버튼이 보이는지 확인한다.
3. 직접 API 호출로 쓰기 작업을 시도한다.

기대 결과:

- viewer는 읽기 중심 동작만 가능해야 한다.
- 쓰기 버튼이 숨겨지거나 비활성화되어야 한다.
- API 쓰기 호출도 차단되어야 한다.

주의:

- 현재 코드가 화면에서만 막고 API에서 role을 강제하지 않는다면 운영 반영 전 보완 대상이다.

## 14. 에러 처리 및 CORS 검증

목적: 로그인 만료, 인증 실패, CORS, API 에러가 사용자 흐름을 깨지 않는지 확인한다.

절차:

1. 로그아웃 상태에서 앱을 새로고침한다.
2. `/api/auth-status`가 `401`을 반환하는지 확인한다.
3. 잘못된 비밀번호로 로그인한다.
4. 정상 비밀번호로 로그인한다.

기대 결과:

- 로그인 전 `401`은 콘솔에 보여도 앱은 로그인 화면을 유지한다.
- 잘못된 비밀번호는 로그인 실패 메시지를 보여준다.
- 정상 로그인 후 데이터가 로드된다.
- 로컬 프론트 `127.0.0.1:3000`에서 로컬 API `localhost:5000` 호출이 CORS로 막히지 않는다.

## 15. 자동화 테스트 검증

목적: 기존 단위 테스트와 타입 체크가 변경 후에도 통과하는지 확인한다.

실행:

```powershell
npm test
npx tsc --noEmit
```

또는 패키지별로 실행:

```powershell
cd server
npm test

cd ..\client
npx tsc --noEmit
```

기대 결과:

- 서버 테스트 통과.
- 클라이언트 타입 체크 통과.
- 실패 시 운영 migration 전에 원인 정리.

## 16. 운영 반영 전 DB migration 검증

목적: 로컬 DB 전체를 운영에 덮어쓰지 않고, 구조 변경만 안전하게 반영할 준비가 됐는지 확인한다.

절차:

1. `server/prisma/schema.prisma` 변경 내용을 확인한다.
2. 운영에 필요한 테이블/컬럼/인덱스만 migration에 포함되는지 확인한다.
3. migration SQL을 생성한다.
4. SQL에 `DROP TABLE`, `DROP SCHEMA`, `TRUNCATE`, `force reset` 성격의 명령이 없는지 확인한다.
5. Neon 백업을 먼저 만든다.
6. 운영에는 `prisma migrate deploy`만 사용한다.

기대 결과:

- 운영 DB 데이터는 보존된다.
- 필요한 구조만 추가/수정된다.
- 로컬 덤프를 Neon에 복원하지 않는다.

금지:

```text
prisma db push --force-reset
DROP SCHEMA public CASCADE
로컬 dump를 Neon에 pg_restore
운영 Transaction/Auth 데이터 덮어쓰기
```

## 최종 승인 기준

운영 반영 전 아래 조건이 모두 만족되어야 한다.

- 로컬 로그인 성공.
- 전체/신규/중복/무효 카운트가 예상과 일치.
- 파일 import가 staging으로 들어감.
- 같은 파일 재-import 시 활성 목록이 누적되지 않음.
- 신규 검증 시 `"Transaction"` 확정 저장.
- 삭제/복구와 감사 로그가 정상.
- viewer 권한이 쓰기 작업을 막음.
- 자동화 테스트와 타입 체크 통과.
- migration SQL 검토 완료.
- Neon 백업 완료.
