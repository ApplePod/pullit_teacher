-- 최초 학원·원장 계정 등록 절차 (Supabase 대시보드 SQL Editor 에서 실행)
-- 1) Authentication > Users 에서 원장 이메일로 사용자 생성 (비밀번호 지정)
-- 2) 생성된 user id 를 아래 :owner_uid 에 넣고 실행
with c as (
  insert into center (name, owner_name) values ('풀잇 테스트학원', '노아') returning id
)
insert into profile (id, center_id, role, name, email)
select ':owner_uid'::uuid, c.id, 'owner', '노아', 'owner@example.com' from c;
