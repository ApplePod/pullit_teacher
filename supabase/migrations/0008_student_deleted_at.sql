-- 학생 삭제와 '휴회' 상태 분리
-- 원본: 휴회(MS99)는 목록에 남아 있는 학적 상태이고, 삭제는 목록에서 사라진다.
-- 기존 구현이 둘 다 state='left' 로 처리해 휴회 학생이 목록에서 사라지던 문제를 바로잡는다.
alter table student add column if not exists deleted_at timestamptz;
create index if not exists student_deleted_idx on student(center_id, deleted_at);
