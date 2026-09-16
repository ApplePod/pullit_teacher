-- =====================================================================
-- 0002_problem.sql — 문항(문제은행) 테이블 (OPER-140)
-- 대상: Supabase Postgres. 적재 대상 = 수학 객관식 5,981 + 영어 5,737.
-- =====================================================================

-- 단원 분류 (OPER-139 분류표). 검색 필터의 소스
create table if not exists unit (
  code         text primary key,             -- 예: math_2022_1_1_1
  subject      subject_code not null,
  curriculum   text,                         -- 2022 / 2015
  large_code   text,                         -- 대단원 코드 (수학 s_l, 영어 유형군)
  large_name   text,
  middle_name  text,                         -- 중단원 / 영어 유형
  ord          int default 0
);

-- 문항
create table if not exists problem (
  id                   uuid primary key default gen_random_uuid(),
  problem_code         text unique not null,          -- 예: math_2022_1_1_1_0001
  subject              subject_code not null,
  unit_code            text not null references unit(code),
  question             jsonb not null,                -- 블록 배열
  choices              jsonb,                         -- 객관식 보기 배열
  answer_type          text not null,                 -- multiple_choice
  answer_index         int,
  answer_text          text,
  explanation          jsonb,                         -- insight/solution/diagnosis 3섹션
  difficulty           text,                          -- basic/normal/advanced (수학)
  score                numeric(4,1),
  concept              text,                          -- 수학 소단원(개념)
  cognitive_stage      text,                          -- 수학 인지단계
  recommended_time_sec int,
  source_id            text,
  vocabulary           jsonb,                         -- 영어
  translation          jsonb,                         -- 영어
  created_at           timestamptz not null default now()
);
create index if not exists problem_unit_idx on problem(unit_code);
create index if not exists problem_subject_diff_idx on problem(subject, difficulty);
create index if not exists problem_concept_idx on problem(concept);

-- 문제지-문항 FK (0001 에서 만든 paper_problem 에 연결)
do $$ begin
  alter table paper_problem
    add constraint paper_problem_code_fk foreign key (problem_code) references problem(problem_code);
exception when duplicate_object then null; end $$;

-- RLS: 문항·단원은 로그인한 모든 학원이 읽기 가능(공용 콘텐츠), 쓰기는 service_role 만
alter table unit enable row level security;
alter table problem enable row level security;
do $$ begin
  create policy unit_read on unit for select using (auth.role() = 'authenticated');
exception when duplicate_object then null; end $$;
do $$ begin
  create policy problem_read on problem for select using (auth.role() = 'authenticated');
exception when duplicate_object then null; end $$;
