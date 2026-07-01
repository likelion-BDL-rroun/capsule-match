-- ============================================================
-- 이벤트 로그 테이블 (UX 퍼널 분석용)
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요.
-- 개인정보/학교코드는 저장하지 않습니다. school = 학교 ID, session_id = 브라우저 세션 UUID.
-- ============================================================

create table if not exists public.event_logs (
  id          bigint generated always as identity primary key,
  session_id  text,
  event       text not null,
  school      text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_event_logs_created_at on public.event_logs (created_at);
create index if not exists idx_event_logs_event      on public.event_logs (event);
create index if not exists idx_event_logs_session    on public.event_logs (session_id);

-- RLS 켜고 정책은 만들지 않음 → anon(브라우저)은 접근 불가.
-- 기록은 서버 API가 service_role 로 수행하며 service_role 은 RLS 를 우회합니다.
alter table public.event_logs enable row level security;


-- ============================================================
-- 조회 예시 (Supabase SQL Editor 에서 실행)
-- ============================================================

-- 1) 총 방문자 (visit 이벤트의 고유 세션 수)
select count(distinct session_id) as total_visitors
from event_logs
where event = 'visit';

-- 2) 퍼널 요약 — 단계별 고유 세션 수 + 방문 대비 비율
with sess as (
  select
    count(distinct session_id) filter (where event = 'visit')           as visits,
    count(distinct session_id) filter (where event = 'school_selected') as school_selected,
    count(distinct session_id) filter (where event = 'code_success')    as code_success,
    count(distinct session_id) filter (where event = 'card_clicked')    as card_clicked,
    count(distinct session_id) filter (where event = 'complete')        as completes
  from event_logs
)
select
  visits,
  school_selected,
  code_success,
  card_clicked,
  completes,
  round(100.0 * school_selected / nullif(visits, 0), 1) as "학교선택완료율(%)",
  round(100.0 * card_clicked    / nullif(visits, 0), 1) as "카드선택률(%)",
  round(100.0 * completes       / nullif(visits, 0), 1) as "완료율(%)"
from sess;

-- 3) 코드 성공률 & 실패 횟수
select
  count(*) filter (where event = 'code_success') as code_success,
  count(*) filter (where event = 'code_fail')    as code_fail,
  round(
    100.0 * count(*) filter (where event = 'code_success')
    / nullif(count(*) filter (where event in ('code_success','code_fail')), 0), 1
  ) as "코드성공률(%)"
from event_logs;

-- 4) 평균 완료 시간 (visit -> complete, 같은 세션 기준)
with t as (
  select session_id,
         min(created_at) filter (where event = 'visit')    as visited_at,
         min(created_at) filter (where event = 'complete')  as completed_at
  from event_logs
  group by session_id
)
select round(avg(extract(epoch from (completed_at - visited_at))))::int as "평균완료시간(초)"
from t
where visited_at is not null and completed_at is not null;

-- 5) 카드 선택까지 걸린 평균 시간 (visit -> card_clicked)
with t as (
  select session_id,
         min(created_at) filter (where event = 'visit')        as visited_at,
         min(created_at) filter (where event = 'card_clicked')  as card_at
  from event_logs
  group by session_id
)
select round(avg(extract(epoch from (card_at - visited_at))))::int as "카드선택까지_평균시간(초)"
from t
where visited_at is not null and card_at is not null;

-- 6) 학교별 완료 수 (school = 학교 ID)
select school, count(distinct session_id) as completes
from event_logs
where event = 'complete'
group by school
order by completes desc;
