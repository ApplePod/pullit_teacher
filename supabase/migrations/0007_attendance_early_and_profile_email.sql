-- 출결: 원본은 출석/지각/조퇴/결석/미처리 5종 — enum 에 조퇴(early) 추가
alter type attendance_status add value if not exists 'early';

-- 교사 등록 화면의 이메일(연락용) — auth 계정 이메일(<id>@pullit-teacher.local)과 별개
alter table profile add column if not exists contact_email text;
