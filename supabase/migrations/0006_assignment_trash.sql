-- 채점&클리닉 휴지통 (원본 Clinic/trash.cshtml) — 배정 단위/학생 단위 소프트 삭제
alter table assignment          add column if not exists deleted_at timestamptz;
alter table assignment_student  add column if not exists deleted_at timestamptz;
create index if not exists assignment_deleted_idx on assignment(center_id, deleted_at);
create index if not exists assignment_student_deleted_idx on assignment_student(center_id, deleted_at);
