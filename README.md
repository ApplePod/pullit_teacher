# pullit_teacher — 풀잇 학원 포털

메타수학(mmath.co.kr) 학원 포털을 풀잇 자체 문항 기반으로 재개발하는 프로젝트.

- Jira Epic: [OPER-137 풀잇 학원 포털 재개발](https://newlearnsoft.atlassian.net/browse/OPER-137)
- 하위 작업: OPER-138 ~ OPER-147
- 스택: Next.js + Supabase (Postgres · Auth · Storage) + Vercel
- 참고 자료: `../mmath_복원/` (기존 포털 화면 미러본, `_api_endpoints.md` API 목록)
- 문항 원본: `../수학문항_최신본/`, `../영어문항_최신본/` (JSONL)

## 범위
- 포함: 학원관리(학생·강사·반·출석·교재·통계), 문제지(검색·만들기·PDF·즐겨찾기·공유), 클리닉(채점·오답·리포트), 계정
- 제외: 프리미엄, 지원센터, SMS, 결제·정산, 교과서 페이지 찾기, 쌍둥이 문항

## 환경변수
`.env.local` 에 Supabase URL·키 저장 (git 제외). 템플릿은 `.env.example`.

## 브랜치
- 기본 브랜치: `develop`
