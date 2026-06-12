# 캐릭터 캡슐 뽑기 — 로컬 실행 & 배포 가이드

비개발자도 따라할 수 있도록 단계별로 설명합니다.

---

## 1단계 — Supabase 프로젝트 만들기

1. https://supabase.com 에 접속해 로그인합니다.
2. **New project** 버튼을 눌러 프로젝트를 생성합니다.
3. 프로젝트 이름과 DB 비밀번호를 설정합니다 (비밀번호는 따로 저장해두세요).
4. 프로젝트가 생성될 때까지 1~2분 기다립니다.

---

## 2단계 — DB 스키마 적용

1. Supabase 대시보드 왼쪽 메뉴에서 **SQL Editor**를 클릭합니다.
2. `supabase/schema.sql` 파일 전체 내용을 붙여넣고 **Run** 버튼을 클릭합니다.
3. 성공 메시지가 뜨면 완료입니다.

---

## 3단계 — 테스트 데이터 넣기 (Seed)

1. SQL Editor에서 새 쿼리를 열고 `supabase/seed.sql` 파일 전체 내용을 붙여넣습니다.
2. **Run** 버튼을 클릭합니다.
3. 3개 대학, 3개 캐릭터 데이터가 들어갑니다.

---

## 4단계 — 환경변수 설정

Supabase 대시보드 > **Settings** > **API** 탭에서 아래 값을 확인합니다.

| 변수명 | 위치 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / public |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role (비공개!) |

`.env.local` 파일을 열고 위 값들을 채워넣습니다:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY`는 절대 GitHub에 올리면 안 됩니다.
> `.gitignore`에 `.env.local`이 포함되어 있으므로 자동으로 제외됩니다.

---

## 5단계 — 로컬 실행

터미널(Terminal)에서:

```bash
cd /Users/kim-eunji/capsule-match
npm run dev
```

브라우저에서 http://localhost:3000 을 열면 앱이 실행됩니다.

관리자 화면은 http://localhost:3000/admin 입니다.

---

## 6단계 — Vercel 배포

1. https://vercel.com 에 접속해 로그인합니다.
2. **New Project** > GitHub 저장소를 선택합니다.
3. **Environment Variables** 섹션에서 아래 3개를 추가합니다:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. **Deploy** 버튼을 클릭합니다.

---

## 테스트 시나리오

| 시나리오 | 학교 | 코드 | 예상 결과 |
|---------|------|------|-----------|
| 정상 배정 | OO대학교 | TEST-001 | 캐릭터 1개 랜덤 배정 |
| 재방문 | OO대학교 | (코드 불필요) | 기존 결과 표시 |
| 코드 불일치 | XX대학교 | TEST-001 | 오류 메시지 |
| 정상 배정 | XX대학교 | TEST-002 | 캐릭터 1개 랜덤 배정 |
| 마지막 배정 | YY대학교 | TEST-003 | 마지막 캐릭터 배정 |
| 초과 배정 | (불가) | — | 남은 캐릭터 없음 오류 |

---

## 데이터 초기화 (테스트용)

Supabase SQL Editor에서 아래 SQL을 실행하면 모든 배정이 초기화됩니다.

```sql
UPDATE universities SET assigned_character_id = NULL, assigned_at = NULL;
UPDATE characters SET status = 'available', assigned_university_id = NULL, assigned_at = NULL;
DELETE FROM assignment_logs;
```

> ⚠️ 실제 행사 운영 중에는 절대 실행하지 마세요.
