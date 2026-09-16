-- =====================================================================
-- 0001_domain.sql — 학원·계정 도메인 테이블 및 RLS (OPER-141)
-- 대상: Supabase Postgres. 문항(problem/unit) 테이블은 0002 (OPER-140)에서 생성.
-- 원칙
--   1) 모든 업무 테이블에 center_id 를 두고 RLS 로 학원 단위 격리
--   2) 인증은 Supabase Auth(auth.users). 학원 계정(원장·강사)만 로그인, 학생은 데이터 행
--   3) 문항은 problem_code(text, 예: math_2022_1_1_1_0001) 로 참조. FK 는 0002 에서 추가
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------- enum ----------
create type user_role        as enum ('owner', 'teacher');
create type student_state    as enum ('active', 'paused', 'left');
create type grade_code       as enum ('h1', 'h2', 'h3', 'n', 'etc');      -- 고1·고2·고3·N수·기타
create type subject_code     as enum ('math', 'english');
create type paper_type       as enum ('custom', 'level_test', 'achievement_test', 'calculation');
create type paper_status     as enum ('draft', 'ready', 'deleted');
create type attendance_status as enum ('present', 'late', 'absent', 'excused');
create type assignment_status as enum ('assigned', 'submitted', 'marked');
create type report_kind      as enum ('total', 'wrong', 'book');

-- ---------- 공통 updated_at 트리거 ----------
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- =====================================================================
-- 1. 학원 · 계정
-- =====================================================================
create table center (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  owner_name    text,
  tel           text,
  address       text,
  logo_url      text,
  slogan        text,
  report_style  text default 'v3',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- auth.users 1:1. 학원 계정(원장/강사)
create table profile (
  id            uuid primary key references auth.users(id) on delete cascade,
  center_id     uuid not null references center(id) on delete cascade,
  role          user_role not null default 'teacher',
  name          text not null,
  phone         text,
  email         text,
  access_menu   jsonb not null default '{}'::jsonb,   -- 강사별 메뉴 권한 (mmath f_access_menu)
  is_active     boolean not null default true,
  joined_at     date default current_date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on profile(center_id);

-- ---------- RLS 헬퍼 ----------
create or replace function current_center_id() returns uuid
language sql stable security definer set search_path = public as $$
  select center_id from profile where id = auth.uid()
$$;
create or replace function is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profile where id = auth.uid() and role = 'owner')
$$;

-- =====================================================================
-- 2. 학생 · 반 · 출석 · 교재
-- =====================================================================
create table student (
  id            uuid primary key default gen_random_uuid(),
  center_id     uuid not null references center(id) on delete cascade,
  name          text not null,
  grade         grade_code not null default 'h3',
  phone         text,
  parent_name   text,
  parent_phone  text,
  address       text,
  zip_code      text,
  school        text,
  memo          text,
  state         student_state not null default 'active',
  study_level   text,                                   -- 학원 자체 레벨 표기 (mmath f_study_lv)
  entered_at    date default current_date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on student(center_id, state);

create table class_group (
  id            uuid primary key default gen_random_uuid(),
  center_id     uuid not null references center(id) on delete cascade,
  name          text not null,
  teacher_id    uuid references profile(id) on delete set null,
  grade         grade_code,
  subject       subject_code,
  room          text,
  schedule      jsonb not null default '[]'::jsonb,     -- [{"week":1,"start":"19:00","end":"21:00"}]
  memo          text,
  start_date    date,
  end_date      date,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on class_group(center_id, is_active);

create table class_student (
  class_id      uuid not null references class_group(id) on delete cascade,
  student_id    uuid not null references student(id) on delete cascade,
  center_id     uuid not null references center(id) on delete cascade,
  joined_at     date not null default current_date,
  primary key (class_id, student_id)
);
create index on class_student(student_id);

create table attendance (
  id            uuid primary key default gen_random_uuid(),
  center_id     uuid not null references center(id) on delete cascade,
  student_id    uuid not null references student(id) on delete cascade,
  class_id      uuid references class_group(id) on delete set null,
  attended_on   date not null,
  status        attendance_status not null default 'present',
  memo          text,
  created_by    uuid references profile(id),
  created_at    timestamptz not null default now(),
  unique (student_id, class_id, attended_on)
);
create index on attendance(center_id, attended_on);

-- 교재: 학원이 쓰는 교재 라벨. 외부 문제은행 연동 없음
create table textbook (
  id            uuid primary key default gen_random_uuid(),
  center_id     uuid not null references center(id) on delete cascade,
  name          text not null,
  publisher     text,
  subject       subject_code,
  memo          text,
  created_at    timestamptz not null default now()
);
create table class_textbook (
  class_id      uuid not null references class_group(id) on delete cascade,
  textbook_id   uuid not null references textbook(id) on delete cascade,
  center_id     uuid not null references center(id) on delete cascade,
  primary key (class_id, textbook_id)
);
create table student_textbook (
  student_id    uuid not null references student(id) on delete cascade,
  textbook_id   uuid not null references textbook(id) on delete cascade,
  center_id     uuid not null references center(id) on delete cascade,
  assigned_at   date not null default current_date,
  primary key (student_id, textbook_id)
);

-- =====================================================================
-- 3. 문제지
-- =====================================================================
create table paper_folder (
  id            uuid primary key default gen_random_uuid(),
  center_id     uuid not null references center(id) on delete cascade,
  name          text not null,
  created_at    timestamptz not null default now()
);

create table paper (
  id            uuid primary key default gen_random_uuid(),
  center_id     uuid not null references center(id) on delete cascade,
  created_by    uuid references profile(id) on delete set null,
  name          text not null,
  subject       subject_code not null,
  paper_type    paper_type not null default 'custom',
  status        paper_status not null default 'draft',
  problem_count int  not null default 0,
  total_score   numeric(6,1) not null default 0,
  options       jsonb not null default '{}'::jsonb,    -- 정답공개·해설공개 등 (mmath f_stu_openanswer_yn 계열)
  tags          text[] not null default '{}',
  folder_id     uuid references paper_folder(id) on delete set null,
  is_favorite   boolean not null default false,
  is_shared     boolean not null default false,        -- 학원 내 공유
  deleted_at    timestamptz,                           -- 휴지통
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on paper(center_id, status, deleted_at);
create index on paper(center_id, is_favorite) where is_favorite;

create table paper_problem (
  paper_id      uuid not null references paper(id) on delete cascade,
  center_id     uuid not null references center(id) on delete cascade,
  ord           int  not null,
  problem_code  text not null,                         -- FK → problem(code) 는 0002 에서 추가
  score         numeric(4,1),                          -- null 이면 문항 기본 배점 사용
  primary key (paper_id, ord),
  unique (paper_id, problem_code)
);

-- 즐겨찾기 문항 (개별 문항 단위)
create table favorite_problem (
  center_id     uuid not null references center(id) on delete cascade,
  user_id       uuid not null references profile(id) on delete cascade,
  problem_code  text not null,
  created_at    timestamptz not null default now(),
  primary key (user_id, problem_code)
);

-- =====================================================================
-- 4. 배정 · 채점 · 오답 · 리포트
-- =====================================================================
-- 문제지를 반 또는 학생들에게 배정 (mmath grouppaper)
create table assignment (
  id            uuid primary key default gen_random_uuid(),
  center_id     uuid not null references center(id) on delete cascade,
  paper_id      uuid not null references paper(id) on delete restrict,
  class_id      uuid references class_group(id) on delete set null,
  assigned_by   uuid references profile(id) on delete set null,
  assigned_at   timestamptz not null default now(),
  due_at        timestamptz,
  memo          text
);
create index on assignment(center_id, assigned_at desc);

-- 학생별 배정 상태 (mmath studentpaper)
create table assignment_student (
  id            uuid primary key default gen_random_uuid(),
  center_id     uuid not null references center(id) on delete cascade,
  assignment_id uuid not null references assignment(id) on delete cascade,
  student_id    uuid not null references student(id) on delete cascade,
  status        assignment_status not null default 'assigned',
  correct_count int,
  score         numeric(6,1),
  marked_at     timestamptz,
  marked_by     uuid references profile(id),
  unique (assignment_id, student_id)
);
create index on assignment_student(student_id, status);

-- 문항별 채점 결과
create table marking (
  assignment_student_id uuid not null references assignment_student(id) on delete cascade,
  center_id     uuid not null references center(id) on delete cascade,
  problem_code  text not null,
  answer_index  smallint,                              -- 학생이 고른 번호 (1~5)
  is_correct    boolean,
  marked_at     timestamptz not null default now(),
  primary key (assignment_student_id, problem_code)
);
create index on marking(center_id, problem_code) where is_correct = false;

-- 오답 모음 (mmath collectionIncAnswer)
create table wrong_answer_set (
  id            uuid primary key default gen_random_uuid(),
  center_id     uuid not null references center(id) on delete cascade,
  student_id    uuid not null references student(id) on delete cascade,
  name          text not null,
  paper_id      uuid references paper(id) on delete set null,  -- 오답으로 만든 문제지
  created_by    uuid references profile(id),
  created_at    timestamptz not null default now()
);
create table wrong_answer_item (
  set_id        uuid not null references wrong_answer_set(id) on delete cascade,
  center_id     uuid not null references center(id) on delete cascade,
  problem_code  text not null,
  source_assignment_student_id uuid references assignment_student(id) on delete set null,
  primary key (set_id, problem_code)
);

create table report (
  id            uuid primary key default gen_random_uuid(),
  center_id     uuid not null references center(id) on delete cascade,
  student_id    uuid not null references student(id) on delete cascade,
  kind          report_kind not null,
  name          text not null,
  period_start  date,
  period_end    date,
  payload       jsonb not null default '{}'::jsonb,    -- 생성 시점 스냅샷 (점수·단원별 정답률 등)
  created_by    uuid references profile(id),
  created_at    timestamptz not null default now()
);
create index on report(center_id, student_id, created_at desc);

create table notification (
  id            uuid primary key default gen_random_uuid(),
  center_id     uuid not null references center(id) on delete cascade,
  user_id       uuid references profile(id) on delete cascade,  -- null 이면 학원 전체
  kind          text not null,
  message       text not null,
  link          text,
  is_read       boolean not null default false,
  created_at    timestamptz not null default now()
);
create index on notification(center_id, user_id, is_read);

-- ---------- updated_at 트리거 ----------
do $$ declare t text;
begin
  foreach t in array array['center','profile','student','class_group','paper'] loop
    execute format('create trigger trg_%s_updated before update on %I for each row execute function set_updated_at()', t, t);
  end loop;
end $$;

-- =====================================================================
-- 5. RLS — 모든 테이블: 같은 학원(center_id)만 접근
-- =====================================================================
do $$ declare t text;
begin
  foreach t in array array[
    'student','class_group','class_student','attendance','textbook','class_textbook','student_textbook',
    'paper_folder','paper','paper_problem','favorite_problem',
    'assignment','assignment_student','marking','wrong_answer_set','wrong_answer_item','report','notification'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy %I on %I for select using (center_id = current_center_id())', t||'_select', t);
    execute format('create policy %I on %I for insert with check (center_id = current_center_id())', t||'_insert', t);
    execute format('create policy %I on %I for update using (center_id = current_center_id()) with check (center_id = current_center_id())', t||'_update', t);
    execute format('create policy %I on %I for delete using (center_id = current_center_id())', t||'_delete', t);
  end loop;
end $$;

-- center: 소속 학원만 조회, 수정은 원장만. 생성은 service_role(가입 처리)에서만
alter table center enable row level security;
create policy center_select on center for select using (id = current_center_id());
create policy center_update on center for update using (id = current_center_id() and is_owner());

-- profile: 같은 학원 조회, 본인 수정, 강사 등록·삭제는 원장만
alter table profile enable row level security;
create policy profile_select on profile for select using (center_id = current_center_id());
create policy profile_update_self on profile for update using (id = auth.uid());
create policy profile_update_owner on profile for update using (center_id = current_center_id() and is_owner());
create policy profile_insert_owner on profile for insert with check (center_id = current_center_id() and is_owner());
create policy profile_delete_owner on profile for delete using (center_id = current_center_id() and is_owner() and id <> auth.uid());
