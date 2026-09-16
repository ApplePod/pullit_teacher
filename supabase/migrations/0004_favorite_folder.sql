-- 문항 즐겨찾기 폴더 (원본 Paper/favoriteQuestion.cshtml — '즐겨찾는 문항 폴더')
create table if not exists favorite_folder (
  id          uuid primary key default gen_random_uuid(),
  center_id   uuid not null references center(id) on delete cascade,
  user_id     uuid not null references profile(id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists favorite_folder_center_idx on favorite_folder(center_id, user_id);

alter table favorite_problem add column if not exists folder_id uuid references favorite_folder(id) on delete cascade;
create index if not exists favorite_problem_folder_idx on favorite_problem(folder_id);

-- 폴더별로 같은 문항을 담을 수 있도록 PK 를 (user_id, problem_code) → (user_id, folder_id, problem_code) 로 교체
alter table favorite_problem drop constraint if exists favorite_problem_pkey;
create unique index if not exists favorite_problem_uq on favorite_problem(user_id, coalesce(folder_id, '00000000-0000-0000-0000-000000000000'::uuid), problem_code);

alter table favorite_folder enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='favorite_folder' and policyname='favorite_folder_select') then
    create policy favorite_folder_select on favorite_folder for select using (center_id = current_center_id());
    create policy favorite_folder_insert on favorite_folder for insert with check (center_id = current_center_id());
    create policy favorite_folder_update on favorite_folder for update using (center_id = current_center_id()) with check (center_id = current_center_id());
    create policy favorite_folder_delete on favorite_folder for delete using (center_id = current_center_id());
  end if;
end $$;
