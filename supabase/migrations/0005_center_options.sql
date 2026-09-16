-- 학원정보 > 교실홈 학습 정보 설정 보관 (원본 centerinfo.cshtml 의 ox/sox/oxpub/회차/ori/twin/s001/s002/채널톡)
alter table center add column if not exists options jsonb not null default '{}'::jsonb;
