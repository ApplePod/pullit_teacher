# 메타수학 센터 포털 — 동적 크롤 설계도 (전 화면 복제 기준)

살아있는 원본을 로그인 상태로 자동 탐색해 캡처한 전 화면 명세. 화면·버튼·입력폼·호출 API를 그대로 재현하기 위한 기준. 스크린샷·렌더 HTML은 `mmath_복원_동적/<slug>.png|.html|.json`.

- 캡처 페이지 55개 · 고유 API 80개 · 2026-09-16


## 대시보드 (Dashboard) — 3개 화면

### 체험수학교실
- 경로: `/Pages/Center/` · slug: `pages_center`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 전체 현황 · 반별 현황 (1) · 학생별 종합 현황 (1)
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 오늘 하루 보지 않기 / 전체 현황 / 반별 현황 (1) / 학생별 종합 현황 (1)
- 표: 문제지명 | 단계 | 학년/학기 | 문항수/회차 | 학생
- 표: 제목 | 등록일
- API: center/main/banner, center/main/dashboardinfoasync, center/main/maindefaultinfoasync, center/main/myclasslistasync, center/main/nomarkedpaperlist4prestudentasync, center/main/noticelistasync, center/main/quickmenuinfo, common/checkloginstatus, common/education/educationbannerinfoasync, common/getchanneltalkuserinfo

### 체험수학교실
- 경로: `/Pages/Center/Dashboard/index.cshtml` · slug: `pages_center_dashboard_index_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 전체 현황 · 반별 현황 (1) · 학생별 종합 현황 (1)
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 오늘 하루 보지 않기 / 전체 현황 / 반별 현황 (1) / 학생별 종합 현황 (1)
- 표: 문제지명 | 단계 | 학년/학기 | 문항수/회차 | 학생
- 표: 제목 | 등록일
- API: center/main/banner, center/main/dashboardinfoasync, center/main/maindefaultinfoasync, center/main/myclasslistasync, center/main/nomarkedpaperlist4prestudentasync, center/main/noticelistasync, center/main/quickmenuinfo, common/checkloginstatus, common/education/educationbannerinfoasync, common/getchanneltalkuserinfo

### 체험수학교실
- 경로: `/Pages/Center/Dashboard/trial.cshtml` · slug: `pages_center_dashboard_trial_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 전체 현황 · 반별 현황 (1) · 학생별 종합 현황 (1)
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 오늘 하루 보지 않기 / 전체 현황 / 반별 현황 (1) / 학생별 종합 현황 (1)
- 표: 문제지명 | 단계 | 학년/학기 | 문항수/회차 | 학생
- 표: 제목 | 등록일
- API: center/main/banner, center/main/dashboardinfoasync, center/main/maindefaultinfoasync, center/main/myclasslistasync, center/main/nomarkedpaperlist4prestudentasync, center/main/noticelistasync, center/main/quickmenuinfo, common/checkloginstatus, common/education/educationbannerinfoasync, common/getchanneltalkuserinfo


## 문제지 보관함 (Paper) — 8개 화면

### 문제지 보관함
- 경로: `/Pages/Center/Paper/favorite.cshtml` · slug: `pages_center_paper_favorite_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 내 문제지 · 즐겨찾기 · 공유 문제지 · 테마별 문제지 · 휴지통
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 내 문제지 / 즐겨찾기 / 공유 문제지 / 테마별 문제지 / 휴지통 / 문제지 즐겨찾기 / 문항 즐겨찾기 / 1년 / 6개월 / 초기화 / 필터 저장 / 검색 / add
추가
- 입력: dp1789531635705(text), dp1789531635706(text), 검색어를 입력해주세요.(search), selectAll(checkbox)
- API: center/paper/favoritepaperlistasync, common/checkloginstatus, common/getchanneltalkuserinfo

### 문제지 보관함
- 경로: `/Pages/Center/Paper/favoriteQuestion.cshtml` · slug: `pages_center_paper_favoritequestion_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 내 문제지 · 즐겨찾기 · 공유 문제지 · 테마별 문제지 · 휴지통
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 내 문제지 / 즐겨찾기 / 공유 문제지 / 테마별 문제지 / 휴지통 / 문제지 즐겨찾기 / 문항 즐겨찾기 / 1년 / 6개월 / 검색 / 삭제 / 문항 즐겨찾기 만들기 / Scroll to Top
- 입력: dp1789531641075(text), dp1789531641076(text), 검색어 입력(search), selectAll(checkbox)
- API: center/paper/favoriteproblemlistasync, common/checkloginstatus, common/getchanneltalkuserinfo

### 문제지 보관함
- 경로: `/Pages/Center/Paper/mypaper.cshtml` · slug: `pages_center_paper_mypaper_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 내 문제지 · 즐겨찾기 · 공유 문제지 · 테마별 문제지 · 휴지통
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 내 문제지 / 즐겨찾기 / 공유 문제지 / 테마별 문제지 / 휴지통 / 1년 / 6개월 / 초기화 / 필터 저장 / 검색 / add
추가 / 학생 배정 / 인쇄
- 입력: dp1789531646386(text), dp1789531646387(text), 검색어 입력(search), selectAll(checkbox), f_check(checkbox), f_check(checkbox), f_check(checkbox)
- API: center/paper/mypaperlistasync, common/checkloginstatus, common/getchanneltalkuserinfo

### 문제지 보관함
- 경로: `/Pages/Center/Paper/share.cshtml` · slug: `pages_center_paper_share_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 내 문제지 · 즐겨찾기 · 공유 문제지 · 테마별 문제지 · 휴지통
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 내 문제지 / 즐겨찾기 / 공유 문제지 / 테마별 문제지 / 휴지통 / 1년 / 6개월 / 초기화 / 필터 저장 / 검색 / add
추가 / 학생 배정 / 인쇄
- 입력: dp1789531651808(text), dp1789531651809(text), 검색어를 입력해주세요.(search), chkAll(checkbox)
- API: center/paper/sharedpaperlistasync, common/checkloginstatus, common/getchanneltalkuserinfo

### 문제지 보관함
- 경로: `/Pages/Center/Paper/theme.cshtml` · slug: `pages_center_paper_theme_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 내 문제지 · 즐겨찾기 · 공유 문제지 · 테마별 문제지 · 휴지통
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 내 문제지 / 즐겨찾기 / 공유 문제지 / 테마별 문제지 / 휴지통 / 연산 / 진단평가 / 단원평가 / replay / 학생 배정 / 인쇄 / 보기/편집 / 보기/편집
- 입력: selectAll(checkbox), f_check(checkbox), f_check(checkbox), f_check(checkbox), f_check(checkbox), f_check(checkbox), f_check(checkbox), f_check(checkbox), f_check(checkbox), f_check(checkbox), f_check(checkbox)
- API: center/paper/leveltestpaperlistasync, common/checkloginstatus, common/getchanneltalkuserinfo

### 문제지 보관함
- 경로: `/Pages/Center/Paper/themecalculationpaper.cshtml` · slug: `pages_center_paper_themecalculationpaper_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 내 문제지 · 즐겨찾기 · 공유 문제지 · 테마별 문제지 · 휴지통
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 내 문제지 / 즐겨찾기 / 공유 문제지 / 테마별 문제지 / 휴지통 / 연산 / 진단평가 / 단원평가
- API: center/paper/calculationpaperlistasync, common/checkloginstatus, common/getchanneltalkuserinfo

### 문제지 보관함
- 경로: `/Pages/Center/Paper/themepaperforexam.cshtml` · slug: `pages_center_paper_themepaperforexam_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 내 문제지 · 즐겨찾기 · 공유 문제지 · 테마별 문제지 · 휴지통
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 내 문제지 / 즐겨찾기 / 공유 문제지 / 테마별 문제지 / 휴지통 / 연산 / 진단평가 / 단원평가 / replay / 학생 배정 / 인쇄 / 보기/편집 / 보기/편집
- 입력: selectAll(checkbox), f_check(checkbox), f_check(checkbox), f_check(checkbox), f_check(checkbox), f_check(checkbox), f_check(checkbox), f_check(checkbox), f_check(checkbox), f_check(checkbox), f_check(checkbox)
- API: center/paper/achievementtestpaperlistasync, common/checkloginstatus, common/getchanneltalkuserinfo

### 문제지 보관함
- 경로: `/Pages/Center/Paper/trash.cshtml` · slug: `pages_center_paper_trash_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 내 문제지 · 즐겨찾기 · 공유 문제지 · 테마별 문제지 · 휴지통
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 내 문제지 / 즐겨찾기 / 공유 문제지 / 테마별 문제지 / 휴지통 / 1년 / 6개월 / 초기화 / 필터 저장 / 검색 / add
추가 / 복원하기 / Scroll to Top
- 입력: dp1789531673875(text), dp1789531673876(text), 검색어 입력(search), selectAll(checkbox)
- API: center/paper/trashlistasync, common/checkloginstatus, common/getchanneltalkuserinfo


## 채점&클리닉 (Clinic) — 7개 화면

### 채점&클리닉
- 경로: `/Pages/Center/Clinic/autobook.cshtml` · slug: `pages_center_clinic_autobook_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 학생별 · 반별 · 학생별 채점 · 반별 채점 · 교재매칭채점 · 학습 분석 보고서 · 휴지통
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 학생별 / 반별 / 검색 / 초기화 / Scroll to Top / 학생별 채점 / 반별 채점 / 교재매칭채점 / 학습 분석 보고서 / 휴지통 / 자동등록 / 수동등록 / 1년
- 입력: dp1789531480032(text), dp1789531480033(text), 검색어 입력(search)
- 표: 학년/학기 | 참고서 | 사용학생 | 채점 수정일 | 채점
- API: center/clinic/bookmarking/bookmarkinglist4studentasync, center/common/studenttreelistasync, common/checkloginstatus, common/getchanneltalkuserinfo

### 채점&클리닉
- 경로: `/Pages/Center/Clinic/book.cshtml` · slug: `pages_center_clinic_book_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 학생별 채점 · 반별 채점 · 교재매칭채점 · 학습 분석 보고서
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 학생별 채점 / 반별 채점 / 교재매칭채점 / 학습 분석 보고서 / 자동등록 / 수동등록 / 1년 / 6개월 / 초기화 / 필터 저장 / 검색 / 삭제 / 교재매칭 채점
- 입력: dp1789531485391(text), dp1789531485392(text), 검색어 입력(search), selectMarkingAll(checkbox)
- 표: 학년/학기 | 채점명 | 참고서 | 사용학생 | 채점일/수정일 | 채점
- API: center/clinic/bookmarking/bookmarkinglistasync, common/checkloginstatus, common/getchanneltalkuserinfo

### 채점&클리닉
- 경로: `/Pages/Center/Clinic/class.cshtml` · slug: `pages_center_clinic_class_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 학생별 · 반별 · 학생별 채점 · 반별 채점 · 교재매칭채점 · 학습 분석 보고서 · 휴지통
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 학생별 / 반별 / 검색 / 초기화 / Scroll to Top / 학생별 채점 / 반별 채점 / 교재매칭채점 / 학습 분석 보고서 / 휴지통 / 1년 / 6개월 / 초기화
- 입력: dp1789531490644(text), dp1789531490645(text), 검색어 입력(search)
- API: center/clinic/grouppaper/grouppaperlistasync, center/common/studenttree4grouplistasync, common/checkloginstatus, common/getchanneltalkuserinfo

### 채점&클리닉
- 경로: `/Pages/Center/Clinic/premiumbook.cshtml` · slug: `pages_center_clinic_premiumbook_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 학생별 · 반별 · 학생별 채점 · 반별 채점 · 교재매칭채점 · 학습 분석 보고서 · 휴지통
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 학생별 / 반별 / 검색 / 초기화 / Scroll to Top / 학생별 채점 / 반별 채점 / 교재매칭채점 / 학습 분석 보고서 / 휴지통 / 자동등록 / 수동등록 / 1년
- 입력: 검색어 입력(search)
- API: center/common/studenttreelistasync, center/premi/metabook/assignbooklistasync, common/checkloginstatus, common/getchanneltalkuserinfo

### 채점&클리닉
- 경로: `/Pages/Center/Clinic/report.cshtml` · slug: `pages_center_clinic_report_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 학생별 · 반별 · 학생별 채점 · 반별 채점 · 교재매칭채점 · 학습 분석 보고서 · 휴지통
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 학생별 / 반별 / 검색 / 초기화 / Scroll to Top / 학생별 채점 / 반별 채점 / 교재매칭채점 / 학습 분석 보고서 / 휴지통 / 1년 / 6개월 / 초기화
- 입력: dp1789531501368(text), dp1789531501369(text), 검색어 입력(search), selectAll(checkbox)
- API: center/clinic/report/reportlistasync, center/common/studenttreelistasync, common/checkloginstatus, common/getchanneltalkuserinfo

### 채점&클리닉
- 경로: `/Pages/Center/Clinic/studentmark.cshtml` · slug: `pages_center_clinic_studentmark_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 학생별 · 반별 · 학생별 채점 · 반별 채점 · 교재매칭채점 · 학습 분석 보고서 · 휴지통
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 학생별 / 반별 / 검색 / 초기화 / Scroll to Top / 학생별 채점 / 반별 채점 / 교재매칭채점 / 학습 분석 보고서 / 휴지통 / 1년 / 6개월 / 초기화
- 입력: dp1789531506676(text), dp1789531506677(text), 검색어 입력(search), selectAll(checkbox), chkPaperId(checkbox), chkPaperId(checkbox)
- API: center/clinic/studentpaper/studentpaperlistasync, center/common/studenttreelistasync, common/checkloginstatus, common/getchanneltalkuserinfo

### 채점&클리닉
- 경로: `/Pages/Center/Clinic/trash.cshtml` · slug: `pages_center_clinic_trash_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 학생별 채점 · 반별 채점 · 교재매칭채점 · 학습 분석 보고서 · 휴지통
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 학생별 채점 / 반별 채점 / 교재매칭채점 / 학습 분석 보고서 / 휴지통 / 1년 / 6개월 / 초기화 / 필터 저장 / 검색 / add
추가 / 복원하기 / Scroll to Top
- 입력: dp1789531512065(text), dp1789531512066(text), 검색어 입력(search), selectAll(checkbox)
- API: center/clinic/studentpaper/trashlistasync, common/checkloginstatus, common/getchanneltalkuserinfo


## 관리 (Management) — 11개 화면

### 관리
- 경로: `/Pages/Center/Management/attendance.cshtml` · slug: `pages_center_management_attendance_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 학생별 · 반별 · 학생 · 반 · 교사 · 교재등록 · 교실설정 · 학습현황
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 학생별 / 반별 / 검색 / 초기화 / Scroll to Top / 학생 / 반 / 교사 / 교재등록 / 교실설정 / 학습현황 / 출결 / 수납
- 입력: 검색어 입력(search), userAll(checkbox), chkUId(checkbox)
- 표: 학생명 | 입실 발송 | 퇴실 발송
- 표: 9.1 | 9.2 | 9.3 | 9.4 | 9.5 | 9.6 | 9.7 | 9.8 | 9.9 | 9.10
- API: center/common/studenttreelistasync, center/mng/attendance/attendancelist, common/checkloginstatus, common/getchanneltalkuserinfo

### 관리
- 경로: `/Pages/Center/Management/book.cshtml` · slug: `pages_center_management_book_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 학생 · 반 · 교사 · 교재등록 · 교실설정 · 학습현황 · 출결 · 수납
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 학생 / 반 / 교사 / 교재등록 / 교실설정 / 학습현황 / 출결 / 수납 / 문자 / 개별 학생 사용 교재 관리 / 반 등록 / 반 별 교재 관리 / 학생별 교재 관리
- API: center/mng/book/grouplist, common/checkloginstatus, common/getchanneltalkuserinfo

### 관리
- 경로: `/Pages/Center/Management/centerinfo.cshtml` · slug: `pages_center_management_centerinfo_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 학생 · 반 · 교사 · 교재등록 · 교실설정 · 학습현황 · 출결 · 수납
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 학생 / 반 / 교사 / 교재등록 / 교실설정 / 학습현황 / 출결 / 수납 / 문자 / done
저장하기
- 입력: password(password), addFile(file), 첨부파일(text)
- 표: 오답 바로출제 기능 | 바로 출제 회차 | 원문항 | 쌍둥이 문항 | 유사유형 문항
- API: center/mng/center/centerinfo, common/checkloginstatus, common/getchanneltalkuserinfo

### 관리
- 경로: `/Pages/Center/Management/class.cshtml` · slug: `pages_center_management_class_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 학생 · 반 · 교사 · 교재등록 · 교실설정 · 학습현황 · 출결 · 수납
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 학생 / 반 / 교사 / 교재등록 / 교실설정 / 학습현황 / 출결 / 수납 / 문자 / 검색 / 삭제 / 반 등록 / preview
- 입력: 검색어 입력(search), user(checkbox), f_check(checkbox)
- 표: 반 명 | 학년 | 학생 수 | 등록자 | 등록일 | 메모 | 반 학생 | 상세 | 삭제
- API: center/mng/group/grouplist, common/checkloginstatus, common/getchanneltalkuserinfo

### 개별 학생 사용 교재 관리
- 경로: `/Pages/Center/Management/individualStdBooks.cshtml` · slug: `pages_center_management_individualstdbooks_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 검색 / 교재 선택 취소 / 개별 교재 선택 / 교재매칭 채점 / 교재매칭 문제지만들기
- 입력: 검색어 입력(search), radio-select01(radio), user(checkbox)
- 표: 학생 명 | 학적상태 | 단계 | 학년 | 소속반 | 사용 교재 수
- 표: 교재명 | 구분 | 사용학생
- API: center/common/centergrouplist, center/mng/book/studentlist, common/checkloginstatus, common/getchanneltalkuserinfo

### 관리
- 경로: `/Pages/Center/Management/payment.cshtml` · slug: `pages_center_management_payment_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 학생 · 반 · 교사 · 교재등록 · 교실설정 · 학습현황 · 출결 · 수납
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 학생 / 반 / 교사 / 교재등록 / 교실설정 / 학습현황 / 출결 / 수납 / 문자 / 검색 / 일괄 상태 변경 / 교육비 입력/수정 / 고지서 발송
- 입력: 학생명 입력(search), user(checkbox), chkUserId(checkbox), listPaySum_354570(number), txtPayment_354570(text)
- 표: 학생명 | 단계 | 학년 | 소속반 | 학부모 휴대폰 | 교육비 합계 | 수납 예정일 | 수납일 | 상태 | 고지서
- API: center/mng/member_payment/paymentlist, common/checkloginstatus, common/getchanneltalkuserinfo

### 관리
- 경로: `/Pages/Center/Management/sms.cshtml` · slug: `pages_center_management_sms_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 학생 · 반 · 교사 · 교재등록 · 교실설정 · 학습현황 · 출결 · 수납
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 학생 / 반 / 교사 / 교재등록 / 교실설정 / 학습현황 / 출결 / 수납 / 문자 / 문자 발송 / 문구 템플릿 관리 / 검색 / 유료 문자 신청
- 입력: 전화번호를 입력하세요(search), user(checkbox)
- 표: No. | 구분 | 수신번호 | 문구 | 요청시간 / 전송시간 | 전송 | 재전송
- 표: No. | 문자 구분 | 제목 | 문구 | 삭제 | 관리
- API: center/mng/sms/appsmslist, center/mng/sms/centersmssendno, center/mng/sms/centersmstype, common/checkloginstatus, common/getchanneltalkuserinfo

### 관리
- 경로: `/Pages/Center/Management/statistic.cshtml` · slug: `pages_center_management_statistic_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 학생 · 반 · 교사 · 교재등록 · 교실설정 · 학습현황 · 출결 · 수납
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 학생 / 반 / 교사 / 교재등록 / 교실설정 / 학습현황 / 출결 / 수납 / 문자 / 선생님별 현황 / 반별 현황 / 1년 / 6개월
- 입력: dp1789531603412(text), dp1789531603413(text)
- 표: 원시험지 | 오답1 시험지 | 오답2 시험지 | 오답3 시험지 | 선생님 | 생성 개수 | 채점 개수 | 채점률(평균) | 성취도(평균) | 출제
- 표: 원시험지 | 오답1 시험지 | 오답2 시험지 | 오답3 시험지 | 선생님 | 생성 개수 | 채점 개수 | 채점률(평균) | 성취도(평균) | 출제
- API: center/mng/cinfo/class4centeroptionasync, center/mng/cinfo/classbooksearchasync, center/mng/cinfo/currinfo4classasync, center/mng/cinfo/studyinfo4classasync, center/mng/cinfo/teacher4centeroptionasync, common/checkloginstatus, common/getchanneltalkuserinfo

### 관리
- 경로: `/Pages/Center/Management/student.cshtml` · slug: `pages_center_management_student_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 학생 · 반 · 교사 · 교재등록 · 교실설정 · 학습현황 · 출결 · 수납
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 학생 / 반 / 교사 / 교재등록 / 교실설정 / 학습현황 / 출결 / 수납 / 문자 / 검색 / 일괄 레벨/학적 상태 변경 / 삭제 / 학생 대량 등록
- 입력: schVal(search), user(checkbox), chkStdList(checkbox), f_data4excel(textarea)
- 표: 학생명 | 학생번호 | 학생ID | 학생 휴대폰 | 학부모 휴대폰 | 출결 번호 | 등록일 | 상세 | 삭제
- API: center/mng/student/studentlist, common/checkloginstatus, common/getchanneltalkuserinfo

### 학생 등록하기
- 경로: `/Pages/Center/Management/studentForm.cshtml` · slug: `pages_center_management_studentform_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 우편번호 검색 / 중복체크 / 추가 / 목록으로 / done
저장하기
- 입력: userIdx(tel), stdName(text), stdHp(tel), sltGrade(select-one), f_zip_cd(tel), f_address_1(text), f_address_2(text), parentNm(text), parentHp(text), webId(text), webPW(text), checkPW(text), sltGroupcd(select-one), sltGroupList_0(select-one)
- API: common/checkloginstatus, common/getchanneltalkuserinfo

### 관리
- 경로: `/Pages/Center/Management/teacher.cshtml` · slug: `pages_center_management_teacher_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 학생 · 반 · 교사 · 교재등록 · 교실설정 · 학습현황 · 출결 · 수납
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 학생 / 반 / 교사 / 교재등록 / 교실설정 / 학습현황 / 출결 / 수납 / 문자 / 검색 / 일괄 사용권한 변경 / 삭제 / 교사 등록
- 입력: 검색어 입력(search), user(checkbox)
- 표: 교사명 | 아이디 | 휴대폰 | 메뉴권한 | 등록일 | 관리 | 삭제
- API: center/mng/teacher/teacherlist, common/checkloginstatus, common/getchanneltalkuserinfo


## 마이페이지 (Mypage) — 2개 화면

### 마이페이지
- 경로: `/Pages/Center/Mypage/calculate.cshtml` · slug: `pages_center_mypage_calculate_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 프로필 설정 · 가입하기
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 프로필 설정 / 가입하기
- 입력: 학원·학교명을 입력해주세요.(text), 계약자 성함을 입력해주세요.(text)
- API: center/main/maindefaultinfoasync, center/mypage/centerjoinformasync, common/checkloginstatus, common/getchanneltalkuserinfo

### 마이페이지
- 경로: `/Pages/Center/Mypage/profile.cshtml` · slug: `pages_center_mypage_profile_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 프로필 설정 · 정산 관리
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 프로필 설정 / 정산 관리 / 기본이미지로 변경 / 저장하기 / 비밀번호 변경하기
- 입력: userName(tel), userID(tel), telchange(tel)
- API: center/mypage/profileinfo, common/checkloginstatus, common/getchanneltalkuserinfo


## 프리미엄 (Premium) — 16개 화면

### 프리미엄 기능
- 경로: `/Pages/Center/Premium/MathOperations/Direct.cshtml` · slug: `pages_center_premium_mathoperations_direct_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 개념동영상 · 메타초등연산 · AI내신기출매칭
오픈베타 · KMT학력평가
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 개념동영상 / 메타초등연산 / AI내신기출매칭
오픈베타 / KMT학력평가 / 학생별 자동학습 / 반별 자동학습 / 내 연산지 / 내 연산 채점 / 1년 / 6개월 / 검색 / 학생 배정 / 삭제
- 입력: dp1789531696748(text), dp1789531696749(text), 검색어 입력(search)
- API: center/premi/mathoperations/directlist, common/checkloginstatus, common/getchanneltalkuserinfo

### 프리미엄 기능
- 경로: `/Pages/Center/Premium/MathOperations/Student.cshtml` · slug: `pages_center_premium_mathoperations_student_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 학생별 · 반별 · 개념동영상 · 메타초등연산 · AI내신기출매칭
오픈베타 · KMT학력평가
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 학생별 / 반별 / 검색 / 초기화 / Scroll to Top / 개념동영상 / 메타초등연산 / AI내신기출매칭
오픈베타 / KMT학력평가 / 학생별 자동학습 / 반별 자동학습 / 내 연산지 / 내 연산 채점
- API: center/common/studenttreelistasync, common/checkloginstatus, common/getchanneltalkuserinfo, common/premi/mathoperations/loginuserid

### 메타수학
- 경로: `/Pages/Center/Premium/MathOperations/popup/AssignStudent.cshtml` · slug: `pages_center_premium_mathoperations_popup_assignstudent_cshtml`
- API: center/common/studenttreelistasync, center/paper/paperetesttypeasync, common/checkloginstatus, common/getchanneltalkuserinfo, common/savelogasync

### 메타수학
- 경로: `/Pages/Center/Premium/MathOperations/popup/DirectEvaluation.cshtml` · slug: `pages_center_premium_mathoperations_popup_directevaluation_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리
- 버튼: 문제지 만들기 / notifications / 최영재
님
- API: center/premi/mathoperations/caljindanpaper, common/checkloginstatus, common/getchanneltalkuserinfo, common/premi/mathoperations/studykindsteplist

### 메타수학
- 경로: `/Pages/Center/Premium/MathOperations/popup/MakeStudy.cshtml` · slug: `pages_center_premium_mathoperations_popup_makestudy_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리
- 버튼: 문제지 만들기 / notifications / 최영재
님
- API: common/checkloginstatus, common/getchanneltalkuserinfo

### 메타수학
- 경로: `/Pages/Center/Premium/MathOperations/popup/StudyGoal.cshtml` · slug: `pages_center_premium_mathoperations_popup_studygoal_cshtml`
- API: center/premi/mathoperations/studentstudyoption, common/checkloginstatus, common/getchanneltalkuserinfo, common/premi/mathoperations/studychapterlist, common/savelogasync

### 메타수학
- 경로: `/Pages/Center/Premium/MathOperations/popup/StudySetting.cshtml` · slug: `pages_center_premium_mathoperations_popup_studysetting_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리
- 버튼: 문제지 만들기 / notifications / 최영재
님
- API: center/premi/mathoperations/studentstudyoption, common/checkloginstatus, common/getchanneltalkuserinfo, common/savelogasync

### 메타수학
- 경로: `/Pages/Center/Premium/MathOperations/popup/StudySettingSave.cshtml` · slug: `pages_center_premium_mathoperations_popup_studysettingsave_cshtml`
- API: center/common/studenttreelistasync, common/checkloginstatus, common/getchanneltalkuserinfo

### 메타수학
- 경로: `/Pages/Center/Premium/MathOperations/popup/StudyStepInfo.cshtml` · slug: `pages_center_premium_mathoperations_popup_studystepinfo_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리
- 버튼: 문제지 만들기 / notifications / 최영재
님
- API: common/checkloginstatus, common/getchanneltalkuserinfo

### 프리미엄 기능
- 경로: `/Pages/Center/Premium/Test/aimatch.cshtml` · slug: `pages_center_premium_test_aimatch_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 개념동영상 · 메타연산 · AI내신기출매칭
오픈베타 · KMT학력평가
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 개념동영상 / 메타연산 / AI내신기출매칭
오픈베타 / KMT학력평가 / AI매칭 문제지 / 기출 문제지 / 휴지통 / 1년 / 6개월 / 초기화 / 필터 저장 / 검색 / add
추가
- 입력: dp1789531750418(text), dp1789531750419(text), 검색어 입력(search)
- API: center/premi/test/getauthmatchpaper4trialasync, center/premi/test/matchpaperlistasync, common/checkloginstatus, common/getchanneltalkuserinfo

### 메타수학
- 경로: `/Pages/Center/Premium/Test/pop.UploadPaper.cshtml` · slug: `pages_center_premium_test_pop_uploadpaper_cshtml`
- API: center/premi/test/searchtextbooklistasync, common/checkloginstatus, common/getchanneltalkuserinfo, proxy/ocrhealth

### 프리미엄 기능
- 경로: `/Pages/Center/Premium/Test/trash.cshtml` · slug: `pages_center_premium_test_trash_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 개념동영상 · 메타연산 · AI내신기출매칭
오픈베타 · KMT학력평가
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 개념동영상 / 메타연산 / AI내신기출매칭
오픈베타 / KMT학력평가 / AI매칭 문제지 / 기출 문제지 / 휴지통 / 검색 / add
추가 / 복원하기 / Scroll to Top
- 입력: 검색어 입력(search)
- API: center/premi/test/trashlistasync, common/checkloginstatus, common/getchanneltalkuserinfo

### 프리미엄 기능
- 경로: `/Pages/Center/Premium/Test/uploadpaper.cshtml` · slug: `pages_center_premium_test_uploadpaper_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 개념동영상 · 메타연산 · AI내신기출매칭
오픈베타 · KMT학력평가
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 개념동영상 / 메타연산 / AI내신기출매칭
오픈베타 / KMT학력평가 / AI매칭 문제지 / 기출 문제지 / 휴지통 / 검색 / 시험지 삭제 / 시험지업로드 / 만들기 / 만들기 / 만들기
- 입력: f_school_nm(search)
- API: center/premi/test/getauthuploadpaperopenynasync, center/premi/test/searchuploadpaperlistasync, common/checkloginstatus, common/getchanneltalkuserinfo

### 프리미엄 기능
- 경로: `/Pages/Center/Premium/kmt.cshtml` · slug: `pages_center_premium_kmt_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 개념동영상 · 메타초등연산 · AI내신기출매칭
오픈베타 · KMT학력평가
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 개념동영상 / 메타초등연산 / AI내신기출매칭
오픈베타 / KMT학력평가 / 시험요강 / 응시접수관리 / KMT기출 / KMT본평가 / 채점입력 / 결과/분석표 / 상장출력 / 홍보물
- API: center/common/centergroupgradelist, center/paper/kmtpaperlistasync, center/paper/kmttestsetasync, center/premi/kmt/awardlist, center/premi/kmt/kmtonyn, center/premi/kmt/kmtopentestset, center/premi/kmt/regstudentlist, center/premi/kmt/reportlist, center/premi/kmt/studentlist, common/checkloginstatus, common/getchanneltalkuserinfo

### 프리미엄 기능
- 경로: `/Pages/Center/Premium/kmt/result.excel.cshtml` · slug: `pages_center_premium_kmt_result_excel_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 개념동영상 · 메타초등연산 · AI내신기출매칭
오픈베타 · KMT학력평가
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 개념동영상 / 메타초등연산 / AI내신기출매칭
오픈베타 / KMT학력평가 / 시험요강 / 응시접수관리 / KMT기출 / KMT본평가 / 채점입력 / 결과/분석표 / 상장출력 / 홍보물

### 프리미엄 기능
- 경로: `/Pages/Center/Premium/video.cshtml` · slug: `pages_center_premium_video_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 개념동영상 · 메타초등연산 · AI내신기출매칭
오픈베타 · KMT학력평가
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 개념동영상 / 메타초등연산 / AI내신기출매칭
오픈베타 / KMT학력평가 / 전체 / 배정 완료 / 학생배정 / 보기 / 보기 / 보기 / 보기 / 보기 / 보기
- 입력: chkListAll(checkbox), chkVodSubject(checkbox), chkSbjLchapterId_213(checkbox), chkVodId_213_21300010(checkbox), chkVodId_213_21300010(checkbox), chkVodId_213_21300010(checkbox), chkVodId_213_21300010(checkbox), chkVodId_213_21300010(checkbox), chkVodId_213_21300010(checkbox), chkVodId_213_21300010(checkbox), chkSbjLchapterId_213(checkbox), chkVodId_213_21300020(checkbox), chkVodId_213_21300020(checkbox), chkVodId_213_21300020(checkbox)
- API: center/premi/vod/vodlist, common/checkloginstatus, common/getchanneltalkuserinfo


## 지원센터 (Help) — 5개 화면

### 고객센터
- 경로: `/Pages/Center/Help/11qna.cshtml` · slug: `pages_center_help_11qna_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 공지사항 · FAQ · 1:1문의 · 오류신고 · 자료실
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 공지사항 / FAQ / 1:1문의 / 오류신고 / 자료실 / 검색 / 글쓰기 / Scroll to Top
- 입력: 검색어 입력(search)
- API: center/board/qna11list, common/checkloginstatus, common/getchanneltalkuserinfo

### 고객센터
- 경로: `/Pages/Center/Help/dataroom.cshtml` · slug: `pages_center_help_dataroom_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 공지사항 · FAQ · 1:1문의 · 오류신고 · 자료실
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 공지사항 / FAQ / 1:1문의 / 오류신고 / 자료실 / 검색 / Scroll to Top
- 입력: 검색어 입력(search)
- API: center/board/dataroomlist, common/checkloginstatus, common/getchanneltalkuserinfo

### 고객센터
- 경로: `/Pages/Center/Help/errreport.cshtml` · slug: `pages_center_help_errreport_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 공지사항 · FAQ · 1:1문의 · 오류신고 · 자료실
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 공지사항 / FAQ / 1:1문의 / 오류신고 / 자료실 / 검색 / 글쓰기 / Scroll to Top
- 입력: 검색어 입력(search)
- API: center/board/errreportlist, common/checkloginstatus, common/getchanneltalkuserinfo

### 고객센터
- 경로: `/Pages/Center/Help/faq.cshtml` · slug: `pages_center_help_faq_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 공지사항 · FAQ · 1:1문의 · 오류신고 · 자료실
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 공지사항 / FAQ / 1:1문의 / 오류신고 / 자료실 / 검색
- 입력: 검색어 입력(search)
- API: center/board/faqlist, common/checkloginstatus, common/getchanneltalkuserinfo

### 고객센터
- 경로: `/Pages/Center/Help/notice.cshtml` · slug: `pages_center_help_notice_cshtml`
- 탭/메뉴: 문제지 보관함 · 채점&클리닉 · 프리미엄 · 관리 · 공지사항 · FAQ · 1:1문의 · 오류신고 · 자료실
- 버튼: 문제지 만들기 / notifications / 최영재
님 / 공지사항 / FAQ / 1:1문의 / 오류신고 / 자료실 / 검색 / Scroll to Top
- 입력: 검색어 입력(search)
- API: center/board/noticelist, common/checkloginstatus, common/getchanneltalkuserinfo


## 공용 (shared) — 1개 화면

### 메타수학
- 경로: `/Pages/Center/shared/NotificationPart.cshtml` · slug: `pages_center_shared_notificationpart_cshtml`
- API: center/common/notificationcountasync, center/common/notificationlistasync, common/checkloginstatus, common/getchanneltalkuserinfo


## 기타 (기타) — 2개 화면

### 출제방식 선택
- 경로: `/Pages/Center/makestudy/makestudy.cshtml` · slug: `pages_center_makestudy_makestudy_cshtml`
- 탭/메뉴: 내 템플릿 설정 · 추천 템플릿 설정 · 일반설정 · 상세설정
- 버튼: 닫기 / restart_alt
처음부터 다시하기 / cloud_upload
임시 저장 / 이전 / 다음 / add
추가 / 단원 선택
문제지를 만들 단원을 최소 1개 이상 선택해 / 내 즐겨찾기 설정 / 설정요약 / 저장 / 내 템플릿 설정 / 추천 템플릿 설정 / 일반설정 / 상세설정 / Scroll to Top
- 입력: opt_sA0_problem_cnt(number), f_check_chapter(checkbox), f_check_chapter(checkbox)
- 표: 반/학생 | 판단불가 | 미흡유형 | 노력유형 | 보통유형 | 우수유형 | 완성유형 | 유형 직접 선택 | 총 문항 | 한 문제지 당  문항 수
- API: center/paper/make/chaptertreedataasync

### 메타수학
- 경로: `/Pages/Center/makestudy/pop.selectbookproblem.cshtml` · slug: `pages_center_makestudy_pop_selectbookproblem_cshtml`
- API: center/paper/make/bookpageproblemlist, common/savelogasync


## 전체 API 목록 (호출 화면 수)

- `/proc/center/board/dataroomlist` ×1
- `/proc/center/board/errreportlist` ×1
- `/proc/center/board/faqlist` ×1
- `/proc/center/board/noticelist` ×1
- `/proc/center/board/qna11list` ×1
- `/proc/center/clinic/bookmarking/bookmarkinglist4studentasync` ×1
- `/proc/center/clinic/bookmarking/bookmarkinglistasync` ×1
- `/proc/center/clinic/grouppaper/grouppaperlistasync` ×1
- `/proc/center/clinic/report/reportlistasync` ×1
- `/proc/center/clinic/studentpaper/studentpaperlistasync` ×1
- `/proc/center/clinic/studentpaper/trashlistasync` ×1
- `/proc/center/common/centergroupgradelist` ×1
- `/proc/center/common/centergrouplist` ×1
- `/proc/center/common/notificationcountasync` ×1
- `/proc/center/common/notificationlistasync` ×1
- `/proc/center/common/studenttree4grouplistasync` ×1
- `/proc/center/common/studenttreelistasync` ×8
- `/proc/center/main/banner` ×3
- `/proc/center/main/dashboardinfoasync` ×3
- `/proc/center/main/maindefaultinfoasync` ×4
- `/proc/center/main/myclasslistasync` ×3
- `/proc/center/main/nomarkedpaperlist4prestudentasync` ×3
- `/proc/center/main/noticelistasync` ×3
- `/proc/center/main/quickmenuinfo` ×3
- `/proc/center/mng/attendance/attendancelist` ×1
- `/proc/center/mng/book/grouplist` ×1
- `/proc/center/mng/book/studentlist` ×1
- `/proc/center/mng/center/centerinfo` ×1
- `/proc/center/mng/cinfo/class4centeroptionasync` ×1
- `/proc/center/mng/cinfo/classbooksearchasync` ×1
- `/proc/center/mng/cinfo/currinfo4classasync` ×1
- `/proc/center/mng/cinfo/studyinfo4classasync` ×1
- `/proc/center/mng/cinfo/teacher4centeroptionasync` ×1
- `/proc/center/mng/group/grouplist` ×1
- `/proc/center/mng/member_payment/paymentlist` ×1
- `/proc/center/mng/sms/appsmslist` ×1
- `/proc/center/mng/sms/centersmssendno` ×1
- `/proc/center/mng/sms/centersmstype` ×1
- `/proc/center/mng/student/studentlist` ×1
- `/proc/center/mng/teacher/teacherlist` ×1
- `/proc/center/mypage/centerjoinformasync` ×1
- `/proc/center/mypage/profileinfo` ×1
- `/proc/center/paper/achievementtestpaperlistasync` ×1
- `/proc/center/paper/calculationpaperlistasync` ×1
- `/proc/center/paper/favoritepaperlistasync` ×1
- `/proc/center/paper/favoriteproblemlistasync` ×1
- `/proc/center/paper/kmtpaperlistasync` ×1
- `/proc/center/paper/kmttestsetasync` ×1
- `/proc/center/paper/leveltestpaperlistasync` ×1
- `/proc/center/paper/make/bookpageproblemlist` ×1
- `/proc/center/paper/make/chaptertreedataasync` ×1
- `/proc/center/paper/mypaperlistasync` ×1
- `/proc/center/paper/paperetesttypeasync` ×1
- `/proc/center/paper/sharedpaperlistasync` ×1
- `/proc/center/paper/trashlistasync` ×1
- `/proc/center/premi/kmt/awardlist` ×1
- `/proc/center/premi/kmt/kmtonyn` ×1
- `/proc/center/premi/kmt/kmtopentestset` ×1
- `/proc/center/premi/kmt/regstudentlist` ×1
- `/proc/center/premi/kmt/reportlist` ×1
- `/proc/center/premi/kmt/studentlist` ×1
- `/proc/center/premi/mathoperations/caljindanpaper` ×1
- `/proc/center/premi/mathoperations/directlist` ×1
- `/proc/center/premi/mathoperations/studentstudyoption` ×2
- `/proc/center/premi/metabook/assignbooklistasync` ×1
- `/proc/center/premi/test/getauthmatchpaper4trialasync` ×1
- `/proc/center/premi/test/getauthuploadpaperopenynasync` ×1
- `/proc/center/premi/test/matchpaperlistasync` ×1
- `/proc/center/premi/test/searchtextbooklistasync` ×1
- `/proc/center/premi/test/searchuploadpaperlistasync` ×1
- `/proc/center/premi/test/trashlistasync` ×1
- `/proc/center/premi/vod/vodlist` ×1
- `/proc/common/checkloginstatus` ×52
- `/proc/common/education/educationbannerinfoasync` ×3
- `/proc/common/getchanneltalkuserinfo` ×52
- `/proc/common/premi/mathoperations/loginuserid` ×1
- `/proc/common/premi/mathoperations/studychapterlist` ×1
- `/proc/common/premi/mathoperations/studykindsteplist` ×1
- `/proc/common/savelogasync` ×4
- `/proc/proxy/ocrhealth` ×1