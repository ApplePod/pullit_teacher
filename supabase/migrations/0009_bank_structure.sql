-- =====================================================================
-- 0009_bank_structure.sql — 문제은행 구조 개편 (1·2·3단계)
--  1단계: 학년·학기 축 추가(원본 자동 출제 필터와 동일한 조건으로 조회)
--  2단계: 개념(concept) 정규화 — 개념/유형 학습·오답 재출제의 기준
--  3단계: 문항 관계(problem_link) — 쌍둥이/유사유형
-- =====================================================================

-- 1단계 ----------------------------------------------------------------
alter table unit add column if not exists grade_band  text;    -- elementary / middle / high
alter table unit add column if not exists grade_min   int;     -- 1~3 (학년)
alter table unit add column if not exists grade_max   int;
alter table unit add column if not exists semester    int;     -- 1 / 2 (없으면 null)
alter table unit add column if not exists course_name text;    -- 수학Ⅰ, 확률과 통계, 대의 파악 …
alter table unit add column if not exists exam_scope  text;    -- 수능 / 내신 등

alter table problem add column if not exists grade_band text;
alter table problem add column if not exists grade_min  int;
alter table problem add column if not exists grade_max  int;
alter table problem add column if not exists semester   int;
alter table problem add column if not exists answer_value text;      -- 단답형 정답(원본 JSONL answer_value)
alter table problem add column if not exists glossary   jsonb;       -- 용어 풀이(수학/영어 공통)
create index if not exists problem_grade_idx on problem(subject, grade_band, grade_min, grade_max);
create index if not exists problem_answer_type_idx on problem(subject, answer_type);

-- 2단계 ----------------------------------------------------------------
create table if not exists concept (
  id         uuid primary key default gen_random_uuid(),
  subject    subject_code not null,
  unit_code  text not null references unit(code) on delete cascade,
  name       text not null,
  ord        int not null default 0,
  created_at timestamptz not null default now(),
  unique (unit_code, name)
);
create index if not exists concept_subject_idx on concept(subject, unit_code);

alter table problem add column if not exists concept_id uuid references concept(id) on delete set null;
create index if not exists problem_concept_id_idx on problem(concept_id);

-- 3단계 ----------------------------------------------------------------
-- kind: twin(쌍둥이=같은 개념·같은 난이도·같은 인지단계) / similar(유사유형) / step_up(난이도 상향) / step_down(난이도 하향)
create table if not exists problem_link (
  source_code text not null references problem(problem_code) on delete cascade,
  target_code text not null references problem(problem_code) on delete cascade,
  kind        text not null,
  score       numeric(5,4) not null default 0,   -- 유사도(0~1)
  created_at  timestamptz not null default now(),
  primary key (source_code, target_code, kind),
  check (source_code <> target_code)
);
create index if not exists problem_link_source_idx on problem_link(source_code, kind, score desc);

-- 읽기 RLS (문항과 동일하게 로그인 사용자 공용 읽기, 쓰기는 service_role)
alter table concept enable row level security;
alter table problem_link enable row level security;
do $$ begin
  create policy concept_read on concept for select using (auth.role() = 'authenticated');
exception when duplicate_object then null; end $$;
do $$ begin
  create policy problem_link_read on problem_link for select using (auth.role() = 'authenticated');
exception when duplicate_object then null; end $$;
