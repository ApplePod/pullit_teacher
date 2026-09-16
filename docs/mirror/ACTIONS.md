# 버튼 액션·외형 명세 (원본 실제 클릭 캡처)

각 화면의 보이는 버튼을 실제로 눌러 캡처. `결과`: changed=모달/이동/펼침 등 반응, no_visible_change=반응 없음(외부/JS), not_clicked=저장·삭제 등 변경 위험으로 미클릭(모양만 기록). 계산 스타일은 배경/글자색/테두리/둥글기/패딩/글자크기/높이.


## pages_center  (22 buttons)

| 텍스트 | 클래스 | 배경 | 글자 | 테두리 | 둥글기 | 패딩 | 글자크기 | 높이 | 결과 | 산출물 |
|---|---|---|---|---|---|---|---|---|---|---|
| 오늘 하루 보지 않기 | `button__fill button__line--xsmall button__line--` | rgba(0, 0, 0, 0) | rgb(255, 255, 255) | 1px solid rgb(255, 255, 25 | 4px | 0px 12px | 12px | 32px | no_visible_change |  |
| 전체 현황 | `nav-link active` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 4px | 0px 16px | 14px | 48px | no_visible_change |  |
| 반별 현황 (1) | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 펼침/갱신 | act_02.png |
| 학생별 종합 현황 (1) | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | no_visible_change |  |
| 문제지 채점 현황 1arrow_for | `dashboard__status--card` | rgb(255, 255, 255) | rgb(33, 37, 41) | 1px solid rgb(241, 241, 24 | 4px | 12px 16px | 16px | auto | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| 교재 매칭 채점(학생별) 0arrow | `dashboard__status--card` | rgb(255, 255, 255) | rgb(33, 37, 41) | 1px solid rgb(241, 241, 24 | 4px | 12px 16px | 16px | auto | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| 퀵 메뉴를 등록해 주세요. | `dashboard__status--card` | rgb(255, 255, 255) | rgb(33, 37, 41) | 1px solid rgb(241, 241, 24 | 4px | 12px 16px | 16px | auto | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| 자세히보기 | `link-button__more` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 0px | 0px | 16px | auto | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| 자세히보기 | `link-button__more` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 0px | 0px | 16px | auto | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| [기능/사용성 업데이트] 더 쉽고 편 | `line-clamp-1 title-tooltip` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) | 0px none rgb(52, 52, 64) | 0px | 0px | 14px | auto | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| [콘텐츠 업데이트] 2026년 8월  | `line-clamp-1 title-tooltip` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) | 0px none rgb(52, 52, 64) | 0px | 0px | 14px | auto | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| [기능 업데이트 예정] 더 쉽고 편리 | `line-clamp-1 title-tooltip` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) | 0px none rgb(52, 52, 64) | 0px | 0px | 14px | auto | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| [채팅 상담 업데이트] 채팅 상담 O | `line-clamp-1 title-tooltip` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) | 0px none rgb(52, 52, 64) | 0px | 0px | 14px | auto | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| [공지] 기출문제지 업로드 시 시험지 | `line-clamp-1 title-tooltip` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) | 0px none rgb(52, 52, 64) | 0px | 0px | 14px | auto | not_clicked(danger/external) |  |
|  | `` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 0px | 0px | 16px | auto | not_clicked(danger/external) |  |
|  | `` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 0px | 0px | 16px | auto | not_clicked(danger/external) |  |
|  | `` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 0px | 0px | 16px | 21px | no_visible_change |  |
| QR채점 | `` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 0px | 0px | 14px | 58px | not_clicked(danger/external) |  |
| 출결키패드 | `` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 0px | 0px | 14px | 58px | not_clicked(danger/external) |  |
| 원격지원 | `` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 0px | 0px | 14px | 58px | not_clicked(danger/external) |  |
| 사용매뉴얼 | `` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 0px | 0px | 14px | 58px | not_clicked(danger/external) |  |
| 고객센터 | `` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 0px | 0px | 14px | 58px | not_clicked(danger/external) |  |

## pages_center_clinic_autobook_cshtml  (20 buttons)

| 텍스트 | 클래스 | 배경 | 글자 | 테두리 | 둥글기 | 패딩 | 글자크기 | 높이 | 결과 | 산출물 |
|---|---|---|---|---|---|---|---|---|---|---|
| 학생별 채점 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | click_error:Message: element click intercepted: Element <button class="n |  |
| 반별 채점 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:class.cshtml | act_01.png |
| 교재매칭채점 | `nav-link active` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 4px | 0px 16px | 14px | 48px | no_visible_change |  |
| 학습 분석 보고서 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:report.cshtml | act_03.png |
| 휴지통 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:trash.cshtml | act_04.png |
| 자동등록 | `nav-link active` | rgb(233, 243, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 32px | 0px 16px | 14px | 32px | click_error:Message: element click intercepted: Element <button onclick= |  |
| 수동등록 | `nav-link` | rgba(0, 0, 0, 0) | rgb(86, 86, 97) | 1px solid rgb(86, 86, 97) | 32px | 0px 16px | 14px | 32px | changed → 이동:book.cshtml | act_06.png |
| 1년 | `btn period-btn` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 4px 0px 0px 4px | 0px 14px | 14px | 36px | no_visible_change |  |
| 6개월 | `btn period-btn` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 0px 4px 4px 0px | 0px 14px | 14px | 36px | no_visible_change |  |
| 초기화 | `btn-underline` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) | 0px none rgb(52, 52, 64) | 4px | 1px 6px | 14px | 21.5938px | not_clicked(danger/external) |  |
| 필터 저장 | `btn-underline` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) | 0px none rgb(52, 52, 64) | 4px | 1px 6px | 14px | 21.5938px | not_clicked(danger/external) |  |
| 검색 | `` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) |  | 0px | 0px 16px | 12px | 34px | no_visible_change |  |
| 전체 | `` | rgb(233, 243, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px 0px 0px 4px | 0px 16px | 12px | 36px | no_visible_change |  |
| 초등 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 0px | 0px 16px | 12px | 36px | changed → 펼침/갱신 | act_13.png |
| 중등 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 0px | 0px 16px | 12px | 36px | no_visible_change |  |
| 고등 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 0px 4px 4px 0px | 0px 16px | 12px | 36px | no_visible_change |  |
| Scroll to Top | `scrollToTop` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 4px | 1px 6px | 16px | 32px | no_visible_change |  |
|  | `prev disabled` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 0px | 12px | 32px | no_visible_change |  |
| 1 | `active` | rgb(255, 255, 255) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 4px | 0px | 12px | 32px | no_visible_change |  |
|  | `next` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 0px | 12px | 32px | no_visible_change |  |

## pages_center_clinic_book_cshtml  (6 buttons)

| 텍스트 | 클래스 | 배경 | 글자 | 테두리 | 둥글기 | 패딩 | 글자크기 | 높이 | 결과 | 산출물 |
|---|---|---|---|---|---|---|---|---|---|---|
| 학생별 채점 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:studentmark.cshtml | act_00.png |
| 반별 채점 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:class.cshtml | act_01.png |
| 교재매칭채점 | `nav-link active` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 4px | 0px 16px | 14px | 48px | no_visible_change |  |
| 학습 분석 보고서 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:report.cshtml | act_03.png |
| 자동등록 | `nav-link` | rgba(0, 0, 0, 0) | rgb(86, 86, 97) | 1px solid rgb(86, 86, 97) | 32px | 0px 16px | 14px | 32px | changed → 이동:autobook.cshtml | act_04.png |
| 수동등록 | `nav-link active` | rgb(233, 243, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 32px | 0px 16px | 14px | 32px | changed → 펼침/갱신 | act_05.png |

## pages_center_clinic_class_cshtml  (24 buttons)

| 텍스트 | 클래스 | 배경 | 글자 | 테두리 | 둥글기 | 패딩 | 글자크기 | 높이 | 결과 | 산출물 |
|---|---|---|---|---|---|---|---|---|---|---|
| 학생별 채점 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | click_error:Message: element click intercepted: Element <button class="n |  |
| 반별 채점 | `nav-link active` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 4px | 0px 16px | 14px | 48px | no_visible_change |  |
| 교재매칭채점 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:autobook.cshtml | act_02.png |
| 학습 분석 보고서 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:report.cshtml | act_03.png |
| 휴지통 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:trash.cshtml | act_04.png |
| 1년 | `btn period-btn` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 4px 0px 0px 4px | 0px 14px | 14px | 36px | no_visible_change |  |
| 6개월 | `btn period-btn` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 0px 4px 4px 0px | 0px 14px | 14px | 36px | no_visible_change |  |
| 초기화 | `btn-underline` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) | 0px none rgb(52, 52, 64) | 4px | 1px 6px | 14px | 21.5938px | not_clicked(danger/external) |  |
| 필터 저장 | `btn-underline` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) | 0px none rgb(52, 52, 64) | 4px | 1px 6px | 14px | 21.5938px | not_clicked(danger/external) |  |
| 검색 | `` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) |  | 0px | 0px 16px | 12px | 34px | no_visible_change |  |
| 초등 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 4px 0px 0px 4px | 0px 16px | 12px | 36px | changed → 펼침/갱신 | act_10.png |
| 중등 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 0px | 0px 16px | 12px | 36px | changed → 펼침/갱신 | act_11.png |
| 고등 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 0px 4px 4px 0px | 0px 16px | 12px | 36px | no_visible_change |  |
| add
추가 | `btn-add-delete` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 4px | 0px | 14px | 20px | click_error:Message: element click intercepted: Element <button type="bu |  |
| 채점 | `category-btns-item f-12` | rgb(255, 255, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 16px | 12px | 36px | click_error:Message: element click intercepted: Element <button type="bu |  |
| 오답모음생성 | `category-btns-item f-12` | rgb(255, 255, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 16px | 12px | 36px | click_error:Message: element click intercepted: Element <button type="bu |  |
| 오답출제 | `category-btns-item f-12` | rgb(255, 255, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 16px | 12px | 36px | changed → 모달 | act_16.png, act_16_modal.html |
| 인쇄 | `category-btns-item f-12` | rgb(255, 255, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 16px | 12px | 36px | not_clicked(danger/external) |  |
| 삭제 | `category-btns-item f-12` | rgb(255, 255, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 16px | 12px | 36px | not_clicked(danger/external) |  |
| 엑셀다운 | `category-btns-item f-12` | rgb(255, 255, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 16px | 12px | 36px | not_clicked(danger/external) |  |
| Scroll to Top | `scrollToTop` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 4px | 1px 6px | 16px | 32px | no_visible_change |  |
|  | `prev disabled` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 0px | 12px | 32px | no_visible_change |  |
| 1 | `active` | rgb(255, 255, 255) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 4px | 0px | 12px | 32px | no_visible_change |  |
|  | `next` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 0px | 12px | 32px | no_visible_change |  |

## pages_center_clinic_premiumbook_cshtml  (22 buttons)

| 텍스트 | 클래스 | 배경 | 글자 | 테두리 | 둥글기 | 패딩 | 글자크기 | 높이 | 결과 | 산출물 |
|---|---|---|---|---|---|---|---|---|---|---|
| 학생별 채점 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | click_error:Message: element click intercepted: Element <button class="n |  |
| 반별 채점 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:class.cshtml | act_01.png |
| 교재매칭채점 | `nav-link active` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 4px | 0px 16px | 14px | 48px | no_visible_change |  |
| 학습 분석 보고서 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:report.cshtml | act_03.png |
| 휴지통 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:trash.cshtml | act_04.png |
| 자동등록 | `nav-link` | rgba(0, 0, 0, 0) | rgb(86, 86, 97) | 1px solid rgb(86, 86, 97) | 32px | 0px 16px | 14px | 32px | click_error:Message: element click intercepted: Element <button onclick= |  |
| 수동등록 | `nav-link` | rgba(0, 0, 0, 0) | rgb(86, 86, 97) | 1px solid rgb(86, 86, 97) | 32px | 0px 16px | 14px | 32px | changed → 이동:book.cshtml | act_06.png |
| 1년 | `btn period-btn` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 4px 0px 0px 4px | 0px 14px | 14px | 36px | no_visible_change |  |
| 6개월 | `btn period-btn` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 0px | 0px 14px | 14px | 36px | no_visible_change |  |
| 3개월 | `btn period-btn` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 0px 4px 4px 0px | 0px 14px | 14px | 36px | no_visible_change |  |
| 초기화 | `btn-underline` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) | 0px none rgb(52, 52, 64) | 4px | 1px 6px | 14px | 21.5938px | not_clicked(danger/external) |  |
| 필터 저장 | `btn-underline` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) | 0px none rgb(52, 52, 64) | 4px | 1px 6px | 14px | 21.5938px | not_clicked(danger/external) |  |
| 검색 | `` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) |  | 0px | 0px 16px | 12px | 34px | no_visible_change |  |
| 초등 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 4px 0px 0px 4px | 0px 16px | 12px | 36px | changed → 펼침/갱신 | act_13.png |
| 중등 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 0px | 0px 16px | 12px | 36px | changed → 펼침/갱신 | act_14.png |
| 고등 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 0px 4px 4px 0px | 0px 16px | 12px | 36px | no_visible_change |  |
| add
추가 | `btn-add-delete` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 4px | 0px | 14px | 20px | changed → 펼침/갱신 | act_16.png |
| 삭제 | `category-btns-item` | rgb(255, 255, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 16px | 14px | 36px | not_clicked(danger/external) |  |
| Scroll to Top | `scrollToTop` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 4px | 1px 6px | 16px | 32px | no_visible_change |  |
|  | `prev disabled` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 0px | 12px | 32px | no_visible_change |  |
| 1 | `active` | rgb(255, 255, 255) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 4px | 0px | 12px | 32px | no_visible_change |  |
|  | `next` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 0px | 12px | 32px | no_visible_change |  |

## pages_center_clinic_report_cshtml  (28 buttons)

| 텍스트 | 클래스 | 배경 | 글자 | 테두리 | 둥글기 | 패딩 | 글자크기 | 높이 | 결과 | 산출물 |
|---|---|---|---|---|---|---|---|---|---|---|
| 학생별 채점 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | click_error:Message: element click intercepted: Element <button class="n |  |
| 반별 채점 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:class.cshtml | act_01.png |
| 교재매칭채점 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:autobook.cshtml | act_02.png |
| 학습 분석 보고서 | `nav-link active` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 4px | 0px 16px | 14px | 48px | no_visible_change |  |
| 휴지통 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:trash.cshtml | act_04.png |
| 1년 | `btn period-btn` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 4px 0px 0px 4px | 0px 14px | 14px | 36px | no_visible_change |  |
| 6개월 | `btn period-btn` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 0px 4px 4px 0px | 0px 14px | 14px | 36px | no_visible_change |  |
| 초기화 | `btn-underline` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) | 0px none rgb(52, 52, 64) | 4px | 1px 6px | 14px | 21.5938px | not_clicked(danger/external) |  |
| 필터 저장 | `btn-underline` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) | 0px none rgb(52, 52, 64) | 4px | 1px 6px | 14px | 21.5938px | not_clicked(danger/external) |  |
| 검색 | `` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) |  | 0px | 0px 16px | 12px | 34px | no_visible_change |  |
| 전체 | `` | rgb(233, 243, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 8px | 12px | 36px | no_visible_change |  |
| 종합학습분석표 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 4px | 0px 8px | 12px | 36px | no_visible_change |  |
| 교재별분석표 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 4px | 0px 8px | 12px | 36px | no_visible_change |  |
| 오답학습분석표 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 4px | 0px 8px | 12px | 36px | no_visible_change |  |
| 프리미엄교재학습분석표 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 4px | 0px 8px | 12px | 36px | no_visible_change |  |
| 성취도분석표 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 4px | 0px 8px | 12px | 36px | no_visible_change |  |
| 진단평가분석표 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 4px | 0px 8px | 12px | 36px | no_visible_change |  |
| 일일평가분석표 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 4px | 0px 8px | 12px | 36px | no_visible_change |  |
| 수정 | `category-btns-item f-12` | rgb(255, 255, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 16px | 12px | 36px | click_error:Message: element click intercepted: Element <button type="bu |  |
| 삭제 | `category-btns-item f-12` | rgb(255, 255, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 16px | 12px | 36px | not_clicked(danger/external) |  |
| 인쇄 | `category-btns-item f-12` | rgb(255, 255, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 16px | 12px | 36px | not_clicked(danger/external) |  |
| 학생홈 발송 | `category-btns-item fill f-12` | rgb(30, 133, 255) | rgb(255, 255, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 16px | 12px | 36px | not_clicked(danger/external) |  |
| 문자발송 요청 | `category-btns-item fill f-12` | rgb(30, 133, 255) | rgb(255, 255, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 16px | 12px | 36px | not_clicked(danger/external) |  |
| 분석표 만들기 | `button__line button__fill--medium button__fill--` | rgb(250, 49, 88) | rgb(255, 255, 255) | 0px none rgb(255, 255, 255 | 4px | 0px 16px | 14px | 36px | changed → 모달 | act_23.png, act_23_modal.html |
| Scroll to Top | `scrollToTop` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 4px | 1px 6px | 16px | 32px | no_visible_change |  |
|  | `prev disabled` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 0px | 12px | 32px | no_visible_change |  |
| 1 | `active` | rgb(255, 255, 255) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 4px | 0px | 12px | 32px | no_visible_change |  |
|  | `next` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 0px | 12px | 32px | no_visible_change |  |

## pages_center_clinic_studentmark_cshtml  (27 buttons)

| 텍스트 | 클래스 | 배경 | 글자 | 테두리 | 둥글기 | 패딩 | 글자크기 | 높이 | 결과 | 산출물 |
|---|---|---|---|---|---|---|---|---|---|---|
| 학생별 채점 | `nav-link active` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 4px | 0px 16px | 14px | 48px | click_error:Message: element click intercepted: Element <button class="n |  |
| 반별 채점 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:class.cshtml | act_01.png |
| 교재매칭채점 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:autobook.cshtml | act_02.png |
| 학습 분석 보고서 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:report.cshtml | act_03.png |
| 휴지통 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:trash.cshtml | act_04.png |
| 1년 | `btn period-btn` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 4px 0px 0px 4px | 0px 14px | 14px | 36px | no_visible_change |  |
| 6개월 | `btn period-btn` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 0px 4px 4px 0px | 0px 14px | 14px | 36px | no_visible_change |  |
| 초기화 | `btn-underline` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) | 0px none rgb(52, 52, 64) | 4px | 1px 6px | 14px | 21.5938px | not_clicked(danger/external) |  |
| 필터 저장 | `btn-underline` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) | 0px none rgb(52, 52, 64) | 4px | 1px 6px | 14px | 21.5938px | not_clicked(danger/external) |  |
| 검색 | `` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) |  | 0px | 0px 16px | 12px | 34px | no_visible_change |  |
| 초등 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 4px 0px 0px 4px | 0px 16px | 12px | 36px | click_error:Message: element click intercepted: Element <label for="filt |  |
| 중등 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 0px | 0px 16px | 12px | 36px | changed → 펼침/갱신 | act_11.png |
| 고등 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 0px 4px 4px 0px | 0px 16px | 12px | 36px | no_visible_change |  |
| add
추가 | `btn-add-delete` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 4px | 0px | 14px | 20px | changed → 펼침/갱신 | act_13.png |
| 학생 배정 | `category-btns-item f-12` | rgb(255, 255, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 16px | 12px | 36px | click_error:Message: element click intercepted: Element <button type="bu |  |
| 채점 | `category-btns-item f-12` | rgb(255, 255, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 16px | 12px | 36px | click_error:Message: element click intercepted: Element <button type="bu |  |
| 오답모음생성 | `category-btns-item f-12` | rgb(255, 255, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 16px | 12px | 36px | changed → 모달 | act_16.png, act_16_modal.html |
| 오답출제 | `category-btns-item f-12` | rgb(255, 255, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 16px | 12px | 36px | changed → 모달 | act_17.png, act_17_modal.html |
| 채점 취소 | `category-btns-item f-12` | rgb(255, 255, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 16px | 12px | 36px | changed → 모달 | act_18.png, act_18_modal.html |
| 인쇄 | `category-btns-item f-12` | rgb(255, 255, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 16px | 12px | 36px | not_clicked(danger/external) |  |
| 삭제 | `category-btns-item f-12` | rgb(255, 255, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 16px | 12px | 36px | not_clicked(danger/external) |  |
| 엑셀다운 | `category-btns-item f-12` | rgb(255, 255, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 16px | 12px | 36px | not_clicked(danger/external) |  |
| 학생홈발송 | `category-btns-item f-12` | rgb(255, 255, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 16px | 12px | 36px | not_clicked(danger/external) |  |
| Scroll to Top | `scrollToTop` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 4px | 1px 6px | 16px | 32px | no_visible_change |  |
|  | `prev disabled` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 0px | 12px | 32px | no_visible_change |  |
| 1 | `active` | rgb(255, 255, 255) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 4px | 0px | 12px | 32px | no_visible_change |  |
|  | `disabled next` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 0px | 12px | 32px | no_visible_change |  |

## pages_center_clinic_trash_cshtml  (5 buttons)

| 텍스트 | 클래스 | 배경 | 글자 | 테두리 | 둥글기 | 패딩 | 글자크기 | 높이 | 결과 | 산출물 |
|---|---|---|---|---|---|---|---|---|---|---|
| 학생별 채점 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:studentmark.cshtml | act_00.png |
| 반별 채점 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:class.cshtml | act_01.png |
| 교재매칭채점 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:autobook.cshtml | act_02.png |
| 학습 분석 보고서 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:report.cshtml | act_03.png |
| 휴지통 | `nav-link active` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 4px | 0px 16px | 14px | 48px | changed → 펼침/갱신 | act_04.png |

## pages_center_dashboard_index_cshtml  (21 buttons)

| 텍스트 | 클래스 | 배경 | 글자 | 테두리 | 둥글기 | 패딩 | 글자크기 | 높이 | 결과 | 산출물 |
|---|---|---|---|---|---|---|---|---|---|---|
| 전체 현황 | `nav-link active` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 4px | 0px 16px | 14px | 48px | no_visible_change |  |
| 반별 현황 (1) | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 펼침/갱신 | act_01.png |
| 학생별 종합 현황 (1) | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | no_visible_change |  |
| 문제지 채점 현황 1arrow_for | `dashboard__status--card` | rgb(255, 255, 255) | rgb(33, 37, 41) | 1px solid rgb(241, 241, 24 | 4px | 12px 16px | 16px | auto | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| 교재 매칭 채점(학생별) 0arrow | `dashboard__status--card` | rgb(255, 255, 255) | rgb(33, 37, 41) | 1px solid rgb(241, 241, 24 | 4px | 12px 16px | 16px | auto | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| 퀵 메뉴를 등록해 주세요. | `dashboard__status--card` | rgb(255, 255, 255) | rgb(33, 37, 41) | 1px solid rgb(241, 241, 24 | 4px | 12px 16px | 16px | auto | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| 자세히보기 | `link-button__more` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 0px | 0px | 16px | auto | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| 자세히보기 | `link-button__more` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 0px | 0px | 16px | auto | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| [기능/사용성 업데이트] 더 쉽고 편 | `line-clamp-1 title-tooltip` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) | 0px none rgb(52, 52, 64) | 0px | 0px | 14px | auto | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| [콘텐츠 업데이트] 2026년 8월  | `line-clamp-1 title-tooltip` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) | 0px none rgb(52, 52, 64) | 0px | 0px | 14px | auto | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| [기능 업데이트 예정] 더 쉽고 편리 | `line-clamp-1 title-tooltip` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) | 0px none rgb(52, 52, 64) | 0px | 0px | 14px | auto | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| [채팅 상담 업데이트] 채팅 상담 O | `line-clamp-1 title-tooltip` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) | 0px none rgb(52, 52, 64) | 0px | 0px | 14px | auto | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| [공지] 기출문제지 업로드 시 시험지 | `line-clamp-1 title-tooltip` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) | 0px none rgb(52, 52, 64) | 0px | 0px | 14px | auto | not_clicked(danger/external) |  |
|  | `` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 0px | 0px | 16px | auto | not_clicked(danger/external) |  |
|  | `` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 0px | 0px | 16px | auto | not_clicked(danger/external) |  |
|  | `` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 0px | 0px | 16px | 21px | no_visible_change |  |
| QR채점 | `` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 0px | 0px | 14px | 58px | not_clicked(danger/external) |  |
| 출결키패드 | `` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 0px | 0px | 14px | 58px | not_clicked(danger/external) |  |
| 원격지원 | `` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 0px | 0px | 14px | 58px | not_clicked(danger/external) |  |
| 사용매뉴얼 | `` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 0px | 0px | 14px | 58px | not_clicked(danger/external) |  |
| 고객센터 | `` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 0px | 0px | 14px | 58px | not_clicked(danger/external) |  |

## pages_center_dashboard_trial_cshtml  (21 buttons)

| 텍스트 | 클래스 | 배경 | 글자 | 테두리 | 둥글기 | 패딩 | 글자크기 | 높이 | 결과 | 산출물 |
|---|---|---|---|---|---|---|---|---|---|---|
| 전체 현황 | `nav-link active` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 4px | 0px 16px | 14px | 48px | no_visible_change |  |
| 반별 현황 (1) | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 펼침/갱신 | act_01.png |
| 학생별 종합 현황 (1) | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | no_visible_change |  |
| 문제지 채점 현황 1arrow_for | `dashboard__status--card` | rgb(255, 255, 255) | rgb(33, 37, 41) | 1px solid rgb(241, 241, 24 | 4px | 12px 16px | 16px | auto | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| 교재 매칭 채점(학생별) 0arrow | `dashboard__status--card` | rgb(255, 255, 255) | rgb(33, 37, 41) | 1px solid rgb(241, 241, 24 | 4px | 12px 16px | 16px | auto | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| 퀵 메뉴를 등록해 주세요. | `dashboard__status--card` | rgb(255, 255, 255) | rgb(33, 37, 41) | 1px solid rgb(241, 241, 24 | 4px | 12px 16px | 16px | auto | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| 자세히보기 | `link-button__more` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 0px | 0px | 16px | auto | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| 자세히보기 | `link-button__more` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 0px | 0px | 16px | auto | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| [기능/사용성 업데이트] 더 쉽고 편 | `line-clamp-1 title-tooltip` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) | 0px none rgb(52, 52, 64) | 0px | 0px | 14px | auto | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| [콘텐츠 업데이트] 2026년 8월  | `line-clamp-1 title-tooltip` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) | 0px none rgb(52, 52, 64) | 0px | 0px | 14px | auto | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| [기능 업데이트 예정] 더 쉽고 편리 | `line-clamp-1 title-tooltip` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) | 0px none rgb(52, 52, 64) | 0px | 0px | 14px | auto | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| [채팅 상담 업데이트] 채팅 상담 O | `line-clamp-1 title-tooltip` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) | 0px none rgb(52, 52, 64) | 0px | 0px | 14px | auto | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| [공지] 기출문제지 업로드 시 시험지 | `line-clamp-1 title-tooltip` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) | 0px none rgb(52, 52, 64) | 0px | 0px | 14px | auto | not_clicked(danger/external) |  |
|  | `` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 0px | 0px | 16px | auto | not_clicked(danger/external) |  |
|  | `` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 0px | 0px | 16px | auto | not_clicked(danger/external) |  |
|  | `` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 0px | 0px | 16px | 21px | no_visible_change |  |
| QR채점 | `` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 0px | 0px | 14px | 58px | not_clicked(danger/external) |  |
| 출결키패드 | `` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 0px | 0px | 14px | 58px | not_clicked(danger/external) |  |
| 원격지원 | `` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 0px | 0px | 14px | 58px | not_clicked(danger/external) |  |
| 사용매뉴얼 | `` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 0px | 0px | 14px | 58px | not_clicked(danger/external) |  |
| 고객센터 | `` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 0px | 0px | 14px | 58px | not_clicked(danger/external) |  |

## pages_center_help_11qna_cshtml  (5 buttons)

| 텍스트 | 클래스 | 배경 | 글자 | 테두리 | 둥글기 | 패딩 | 글자크기 | 높이 | 결과 | 산출물 |
|---|---|---|---|---|---|---|---|---|---|---|
| 공지사항 | `` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 0px | 0px | 16px | auto | changed → 이동:notice.cshtml | act_00.png |
| 공지사항 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:notice.cshtml | act_01.png |
| FAQ | `` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 0px | 0px | 16px | auto | changed → 이동:faq.cshtml | act_02.png |
| FAQ | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:faq.cshtml | act_03.png |
| 1:1문의 | `` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 0px | 0px | 16px | auto | no_visible_change |  |

## pages_center_help_dataroom_cshtml  (9 buttons)

| 텍스트 | 클래스 | 배경 | 글자 | 테두리 | 둥글기 | 패딩 | 글자크기 | 높이 | 결과 | 산출물 |
|---|---|---|---|---|---|---|---|---|---|---|
| 공지사항 | `` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 0px | 0px | 16px | auto | changed → 이동:notice.cshtml | act_00.png |
| 공지사항 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:notice.cshtml | act_01.png |
| FAQ | `` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 0px | 0px | 16px | auto | changed → 이동:faq.cshtml | act_02.png |
| FAQ | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:faq.cshtml | act_03.png |
| 1:1문의 | `` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 0px | 0px | 16px | auto | changed → 이동:11qna.cshtml | act_04.png |
| 1:1문의 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:11qna.cshtml | act_05.png |
| 오류신고 | `` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 0px | 0px | 16px | auto | changed → 이동:errreport.cshtml | act_06.png |
| 오류신고 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:errreport.cshtml | act_07.png |
| 자료실 | `` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 0px | 0px | 16px | auto | changed → 펼침/갱신 | act_08.png |

## pages_center_help_errreport_cshtml  (7 buttons)

| 텍스트 | 클래스 | 배경 | 글자 | 테두리 | 둥글기 | 패딩 | 글자크기 | 높이 | 결과 | 산출물 |
|---|---|---|---|---|---|---|---|---|---|---|
| 공지사항 | `` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 0px | 0px | 16px | auto | changed → 이동:notice.cshtml | act_00.png |
| 공지사항 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:notice.cshtml | act_01.png |
| FAQ | `` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 0px | 0px | 16px | auto | changed → 이동:faq.cshtml | act_02.png |
| FAQ | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:faq.cshtml | act_03.png |
| 1:1문의 | `` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 0px | 0px | 16px | auto | changed → 이동:11qna.cshtml | act_04.png |
| 1:1문의 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:11qna.cshtml | act_05.png |
| 오류신고 | `` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 0px | 0px | 16px | auto | no_visible_change |  |

## pages_center_help_faq_cshtml  (3 buttons)

| 텍스트 | 클래스 | 배경 | 글자 | 테두리 | 둥글기 | 패딩 | 글자크기 | 높이 | 결과 | 산출물 |
|---|---|---|---|---|---|---|---|---|---|---|
| 공지사항 | `` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 0px | 0px | 16px | auto | changed → 이동:notice.cshtml | act_00.png |
| 공지사항 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:notice.cshtml | act_01.png |
| FAQ | `` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 0px | 0px | 16px | auto | changed → 펼침/갱신 | act_02.png |

## pages_center_help_notice_cshtml  (1 buttons)

| 텍스트 | 클래스 | 배경 | 글자 | 테두리 | 둥글기 | 패딩 | 글자크기 | 높이 | 결과 | 산출물 |
|---|---|---|---|---|---|---|---|---|---|---|
| 공지사항 | `` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 0px | 0px | 16px | auto | changed → 펼침/갱신 | act_00.png |

## pages_center_makestudy_makestudy_cshtml  (25 buttons)

| 텍스트 | 클래스 | 배경 | 글자 | 테두리 | 둥글기 | 패딩 | 글자크기 | 높이 | 결과 | 산출물 |
|---|---|---|---|---|---|---|---|---|---|---|
| 출제방식 선택 | `accordion-button` | rgb(255, 255, 255) | rgb(59, 59, 71) | 0px none rgb(59, 59, 71) | 5px 5px 0px 0px | 16px 24px | 16px | 51.1875px | no_visible_change |  |
| 자동 출제 | `` | rgb(233, 243, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px 0px 0px 4px | 0px 16px | 12px | 36px | no_visible_change |  |
| 직접 출제 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 0px | 0px 16px | 12px | 36px | no_visible_change |  |
| 교재매칭 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 0px 4px 4px 0px | 0px 16px | 12px | 36px | changed → 펼침/갱신 | act_03.png |
| 학습종류 선택 | `accordion-button` | rgb(255, 255, 255) | rgb(59, 59, 71) | 0px none rgb(59, 59, 71) | 5px 5px 0px 0px | 16px 24px | 16px | auto | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| 기본학습 | `` | rgb(233, 243, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px 0px 0px 4px | 0px 16px | 12px | 36px | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| 개념/유형 학습 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 0px | 0px 16px | 12px | 36px | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| 대입기출 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 0px | 0px 16px | 12px | 36px | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| 학생별 맞춤 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 0px | 0px 16px | 12px | 36px | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| 오답집중 학습 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 0px | 0px 16px | 12px | 36px | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| 유형집중 학습 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 0px 4px 4px 0px | 0px 16px | 12px | 36px | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| 교육 단계학년학기 선택추가 선택 가능 | `accordion-button button-none` | rgb(255, 255, 255) | rgb(59, 59, 71) | 0px none rgb(59, 59, 71) | 0px | 16px 24px | 16px | auto | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| 새교육과정 | `` | rgb(233, 243, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 8px | 12px | 36px | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| 초등 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 4px 0px 0px 4px | 0px 16px | 12px | 36px | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| 중등 | `` | rgb(233, 243, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 0px | 0px 16px | 12px | 36px | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| 고등 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 0px 4px 4px 0px | 0px 16px | 12px | 36px | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| 1학년 | `` | rgb(233, 243, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 8px | 12px | 36px | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| 2학년 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 4px | 0px 8px | 12px | 36px | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| 3학년 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 4px | 0px 8px | 12px | 36px | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| 전체 | `` | rgb(233, 243, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 8px | 12px | 36px | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| 1학기 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 4px | 0px 8px | 12px | 36px | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| 2학기 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 4px | 0px 8px | 12px | 36px | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| add 추가 | `btn-add-delete` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 4px | 0px | 14px | auto | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| 문항수 | `accordion-button gap-1` | rgb(255, 255, 255) | rgb(59, 59, 71) | 0px none rgb(59, 59, 71) | 0px | 16px 24px | 16px | auto | click_error:Message: element not interactable
  (Session info: chrome=15 |  |
| 단원 선택 문제지를 만들 단원을 최소 | `accordion-button button-none` | rgb(255, 255, 255) | rgb(59, 59, 71) | 0px none rgb(59, 59, 71) | 5px 5px 0px 0px | 16px 24px | 16px | auto | click_error:Message: element not interactable
  (Session info: chrome=15 |  |

## pages_center_management_attendance_cshtml  (7 buttons)

| 텍스트 | 클래스 | 배경 | 글자 | 테두리 | 둥글기 | 패딩 | 글자크기 | 높이 | 결과 | 산출물 |
|---|---|---|---|---|---|---|---|---|---|---|
| 학생 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | click_error:Message: element click intercepted: Element <button class="n |  |
| 반 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | click_error:Message: element click intercepted: Element <button class="n |  |
| 교사 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:teacher.cshtml | act_02.png |
| 교재등록 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:book.cshtml | act_03.png |
| 교실설정 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:centerinfo.cshtml | act_04.png |
| 학습현황 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:statistic.cshtml | act_05.png |
| 출결 | `nav-link active` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 4px | 0px 16px | 14px | 48px | changed → 펼침/갱신 | act_06.png |

## pages_center_management_book_cshtml  (4 buttons)

| 텍스트 | 클래스 | 배경 | 글자 | 테두리 | 둥글기 | 패딩 | 글자크기 | 높이 | 결과 | 산출물 |
|---|---|---|---|---|---|---|---|---|---|---|
| 학생 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:student.cshtml | act_00.png |
| 반 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:class.cshtml | act_01.png |
| 교사 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:teacher.cshtml | act_02.png |
| 교재등록 | `nav-link active` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 4px | 0px 16px | 14px | 48px | changed → 펼침/갱신 | act_03.png |

## pages_center_management_centerinfo_cshtml  (5 buttons)

| 텍스트 | 클래스 | 배경 | 글자 | 테두리 | 둥글기 | 패딩 | 글자크기 | 높이 | 결과 | 산출물 |
|---|---|---|---|---|---|---|---|---|---|---|
| 학생 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:student.cshtml | act_00.png |
| 반 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:class.cshtml | act_01.png |
| 교사 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:teacher.cshtml | act_02.png |
| 교재등록 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:book.cshtml | act_03.png |
| 교실설정 | `nav-link active` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 4px | 0px 16px | 14px | 48px | changed → 펼침/갱신 | act_04.png |

## pages_center_management_class_cshtml  (2 buttons)

| 텍스트 | 클래스 | 배경 | 글자 | 테두리 | 둥글기 | 패딩 | 글자크기 | 높이 | 결과 | 산출물 |
|---|---|---|---|---|---|---|---|---|---|---|
| 학생 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:student.cshtml | act_00.png |
| 반 | `nav-link active` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 4px | 0px 16px | 14px | 48px | changed → 펼침/갱신 | act_01.png |

## pages_center_management_individualstdbooks_cshtml  (22 buttons)

| 텍스트 | 클래스 | 배경 | 글자 | 테두리 | 둥글기 | 패딩 | 글자크기 | 높이 | 결과 | 산출물 |
|---|---|---|---|---|---|---|---|---|---|---|
| 검색 | `` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) |  | 0px | 0px 16px | 12px | 34px | no_visible_change |  |
| 전체 | `` | rgb(233, 243, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 8px | 12px | 36px | no_visible_change |  |
| 초1 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 4px | 0px 8px | 12px | 36px | no_visible_change |  |
| 초2 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 4px | 0px 8px | 12px | 36px | no_visible_change |  |
| 초3 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 4px | 0px 8px | 12px | 36px | no_visible_change |  |
| 초4 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 4px | 0px 8px | 12px | 36px | no_visible_change |  |
| 초5 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 4px | 0px 8px | 12px | 36px | no_visible_change |  |
| 초6 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 4px | 0px 8px | 12px | 36px | no_visible_change |  |
| 중1 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 4px | 0px 8px | 12px | 36px | no_visible_change |  |
| 중2 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 4px | 0px 8px | 12px | 36px | no_visible_change |  |
| 중3 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 4px | 0px 8px | 12px | 36px | no_visible_change |  |
| 고1 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 4px | 0px 8px | 12px | 36px | no_visible_change |  |
| 고2 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 4px | 0px 8px | 12px | 36px | no_visible_change |  |
| 고3 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 4px | 0px 8px | 12px | 36px | no_visible_change |  |
| 예비 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 4px 0px 0px 4px | 0px 16px | 12px | 36px | no_visible_change |  |
| 정규 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 0px | 0px 16px | 12px | 36px | no_visible_change |  |
| 휴회 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 0px 4px 4px 0px | 0px 16px | 12px | 36px | no_visible_change |  |
| 교재 선택 취소 | `category-btns-item` | rgb(255, 255, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 16px | 14px | 36px | changed → 모달 | act_17.png, act_17_modal.html |
| 개별 교재 선택 | `button__line button__fill--medium button__fill--` | rgb(250, 49, 88) | rgb(255, 255, 255) | 0px none rgb(255, 255, 255 | 4px | 0px 16px | 14px | 36px | changed → 모달 | act_18.png, act_18_modal.html |
| 교재매칭 채점 | `button__line button__fill--medium button__fill--` | rgb(250, 49, 88) | rgb(255, 255, 255) | 0px none rgb(255, 255, 255 | 4px | 0px 16px | 14px | 36px | changed → iframe:BookMarkingStep1.cshtml?bIds | act_19.png |
| 교재매칭 문제지만들기 | `button__line button__fill--medium button__fill--` | rgb(250, 49, 88) | rgb(255, 255, 255) | 0px none rgb(255, 255, 255 | 4px | 0px 16px | 14px | 36px | click_error:Message: element click intercepted: Element <button type="bu |  |
| 교재명 | `form-check-label d-flex flex-column` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) | 0px none rgb(52, 52, 64) | 0px | 0px | 12px | 20px | click_error:Message: element click intercepted: Element <label for="chec |  |

## pages_center_management_payment_cshtml  (22 buttons)

| 텍스트 | 클래스 | 배경 | 글자 | 테두리 | 둥글기 | 패딩 | 글자크기 | 높이 | 결과 | 산출물 |
|---|---|---|---|---|---|---|---|---|---|---|
| 학생 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:student.cshtml | act_00.png |
| 반 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:class.cshtml | act_01.png |
| 교사 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:teacher.cshtml | act_02.png |
| 교재등록 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:book.cshtml | act_03.png |
| 교실설정 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:centerinfo.cshtml | act_04.png |
| 학습현황 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:statistic.cshtml | act_05.png |
| 출결 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:attendance.cshtml | act_06.png |
| 수납 | `nav-link active` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 4px | 0px 16px | 14px | 48px | not_clicked(danger/external) |  |
| 문자 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:sms.cshtml | act_08.png |
| 검색 | `` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) |  | 0px | 0px 16px | 12px | 34px | no_visible_change |  |
| 전체 | `` | rgb(233, 243, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 8px | 12px | 36px | no_visible_change |  |
| 수납 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 4px | 0px 8px | 12px | 36px | no_visible_change |  |
| 미납 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 4px | 0px 8px | 12px | 36px | click_error:Message: element click intercepted: Element <label for="rdoP |  |
| 일괄 상태 변경 | `category-btns-item` | rgb(255, 255, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 16px | 14px | 36px | not_clicked(danger/external) |  |
| 교육비 입력/수정 | `category-btns-item` | rgb(255, 255, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 16px | 14px | 36px | changed → 모달 | act_14.png, act_14_modal.html |
| 고지서 발송 | `category-btns-item` | rgb(255, 255, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 16px | 14px | 36px | not_clicked(danger/external) |  |
| 영수증 발송 | `category-btns-item` | rgb(255, 255, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 16px | 14px | 36px | not_clicked(danger/external) |  |
| 학생명 | `form-check-label d-flex flex-column` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) | 0px none rgb(52, 52, 64) | 0px | 0px | 12px | 20px | no_visible_change |  |
| Scroll to Top | `scrollToTop` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 4px | 1px 6px | 16px | 32px | no_visible_change |  |
|  | `prev disabled` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 0px | 12px | 32px | no_visible_change |  |
| 1 | `active` | rgb(255, 255, 255) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 4px | 0px | 12px | 32px | no_visible_change |  |
|  | `next` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 0px | 12px | 32px | no_visible_change |  |

## pages_center_management_sms_cshtml  (9 buttons)

| 텍스트 | 클래스 | 배경 | 글자 | 테두리 | 둥글기 | 패딩 | 글자크기 | 높이 | 결과 | 산출물 |
|---|---|---|---|---|---|---|---|---|---|---|
| 학생 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:student.cshtml | act_00.png |
| 반 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:class.cshtml | act_01.png |
| 교사 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:teacher.cshtml | act_02.png |
| 교재등록 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:book.cshtml | act_03.png |
| 교실설정 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:centerinfo.cshtml | act_04.png |
| 학습현황 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:statistic.cshtml | act_05.png |
| 출결 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:attendance.cshtml | act_06.png |
| 수납 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | not_clicked(danger/external) |  |
| 문자 | `nav-link active` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 4px | 0px 16px | 14px | 48px | changed → 펼침/갱신 | act_08.png |

## pages_center_management_statistic_cshtml  (6 buttons)

| 텍스트 | 클래스 | 배경 | 글자 | 테두리 | 둥글기 | 패딩 | 글자크기 | 높이 | 결과 | 산출물 |
|---|---|---|---|---|---|---|---|---|---|---|
| 학생 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:student.cshtml | act_00.png |
| 반 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:class.cshtml | act_01.png |
| 교사 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:teacher.cshtml | act_02.png |
| 교재등록 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:book.cshtml | act_03.png |
| 교실설정 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:centerinfo.cshtml | act_04.png |
| 학습현황 | `nav-link active` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 4px | 0px 16px | 14px | 48px | changed → 펼침/갱신 | act_05.png |

## pages_center_management_student_cshtml  (1 buttons)

| 텍스트 | 클래스 | 배경 | 글자 | 테두리 | 둥글기 | 패딩 | 글자크기 | 높이 | 결과 | 산출물 |
|---|---|---|---|---|---|---|---|---|---|---|
| 학생 | `nav-link active` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 4px | 0px 16px | 14px | 48px | changed → 펼침/갱신 | act_00.png |

## pages_center_management_studentform_cshtml  (32 buttons)

| 텍스트 | 클래스 | 배경 | 글자 | 테두리 | 둥글기 | 패딩 | 글자크기 | 높이 | 결과 | 산출물 |
|---|---|---|---|---|---|---|---|---|---|---|
| 학생 상태 | `form-label required` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 0px | 14px | 19.5938px | no_visible_change |  |
| 예비학생 | `w-100` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 4px 0px 0px 4px | 0px 16px | 12px | 40px | no_visible_change |  |
| 정규학생 | `w-100` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 0px 4px 4px 0px | 0px 16px | 12px | 40px | no_visible_change |  |
| 학생번호 | `form-label` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 0px | 14px | 19.5938px | no_visible_change |  |
| 학생명 | `form-label required` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 0px | 14px | 19.5938px | no_visible_change |  |
| 학생 휴대폰 | `form-label` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 0px | 14px | 19.5938px | no_visible_change |  |
| 주소 | `form-label` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 0px | 14px | 19.5938px | changed → 모달 | act_06.png, act_06_modal.html |
| 우편번호 검색 | `btn btn-default` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) | 1px solid rgb(220, 220, 22 | 4px | 6px 12px | 14px | 40px | no_visible_change |  |
| 보호자명 | `form-label required` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 0px | 14px | 19.5938px | no_visible_change |  |
| 보호자 휴대폰 | `form-label required` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 0px | 14px | 19.5938px | no_visible_change |  |
| 학생홈 ID | `form-label` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 0px | 14px | 19.5938px | changed → 모달 | act_10.png, act_10_modal.html |
| 중복체크 | `btn btn-default` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) | 1px solid rgb(220, 220, 22 | 4px | 6px 12px | 14px | 40px | changed → 모달 | act_11.png, act_11_modal.html |
| 학생홈 비밀번호 | `form-label` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 0px | 14px | 19.5938px | no_visible_change |  |
| 학생 레벨 | `form-label` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 0px | 14px | 19.5938px | no_visible_change |  |
| L1 | `w-100` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 4px 0px 0px 4px | 0px 16px | 12px | 40px | no_visible_change |  |
| L2 | `w-100` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 0px | 0px 16px | 12px | 40px | no_visible_change |  |
| L3 | `w-100` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 0px | 0px 16px | 12px | 40px | no_visible_change |  |
| L4 | `w-100` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 0px | 0px 16px | 12px | 40px | no_visible_change |  |
| L5 | `w-100` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 0px | 0px 16px | 12px | 40px | no_visible_change |  |
| L6 | `w-100` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 0px | 0px 16px | 12px | 40px | no_visible_change |  |
| L7 | `w-100` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 0px 4px 4px 0px | 0px 16px | 12px | 40px | no_visible_change |  |
| 출결 비밀번호 | `form-label` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 0px | 14px | 19.5938px | no_visible_change |  |
| 학생홈 교재정답 | `form-label` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 0px | 14px | 19.5938px | no_visible_change |  |
| 공개 | `w-100` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 4px 0px 0px 4px | 0px 16px | 12px | 40px | no_visible_change |  |
| 비공개 | `w-100` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 0px 4px 4px 0px | 0px 16px | 12px | 40px | no_visible_change |  |
| 반 배정 | `form-label` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 0px | 14px | 19.5938px | no_visible_change |  |
| 추가 | `btn btn-default button__line--medium` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) | 1px solid rgb(220, 220, 22 | 4px | 0px 16px | 14px | 40px | changed → 펼침/갱신 | act_26.png |
| 등록일자 | `form-label` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 0px | 14px | 19.5938px | no_visible_change |  |
| 등록자 | `form-label` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 0px | 14px | 19.5938px | no_visible_change |  |
| 상담 메모 | `form-label` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 0px | 14px | 19.5938px | no_visible_change |  |
| 목록으로 | `button__fill button__line--small button__line--w` | rgb(255, 255, 255) | rgb(33, 37, 41) | 1px solid rgb(220, 220, 22 | 4px | 0px 16px | 14px | 36px | changed → 모달 | act_30.png, act_30_modal.html |
| done
저장하기 | `button__fill--blue button__line--small` | rgb(30, 133, 255) | rgb(255, 255, 255) | 0px none rgb(255, 255, 255 | 4px | 0px 16px | 14px | 36px | not_clicked(danger/external) |  |

## pages_center_management_teacher_cshtml  (3 buttons)

| 텍스트 | 클래스 | 배경 | 글자 | 테두리 | 둥글기 | 패딩 | 글자크기 | 높이 | 결과 | 산출물 |
|---|---|---|---|---|---|---|---|---|---|---|
| 학생 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:student.cshtml | act_00.png |
| 반 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:class.cshtml | act_01.png |
| 교사 | `nav-link active` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 4px | 0px 16px | 14px | 48px | changed → 펼침/갱신 | act_02.png |

## pages_center_mypage_calculate_cshtml  (3 buttons)

| 텍스트 | 클래스 | 배경 | 글자 | 테두리 | 둥글기 | 패딩 | 글자크기 | 높이 | 결과 | 산출물 |
|---|---|---|---|---|---|---|---|---|---|---|
| 프로필 설정 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:profile.cshtml | act_00.png |
| 가입하기 | `nav-link active` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 4px | 0px 16px | 14px | 48px | no_visible_change |  |
| 가입 신청하기 | `btn-primary` | rgb(250, 49, 88) | rgb(255, 255, 255) | 0px none rgb(250, 49, 88) | 4px | 0px | 16px | 56px | not_clicked(danger/external) |  |

## pages_center_mypage_profile_cshtml  (9 buttons)

| 텍스트 | 클래스 | 배경 | 글자 | 테두리 | 둥글기 | 패딩 | 글자크기 | 높이 | 결과 | 산출물 |
|---|---|---|---|---|---|---|---|---|---|---|
| 프로필 설정 | `nav-link active` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 4px | 0px 16px | 14px | 48px | no_visible_change |  |
| 정산 관리 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:calculate4signup.cshtml | act_01.png |
|  | `` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 4px | 0px | 16px | 64px | no_visible_change |  |
| 기본이미지로 변경 | `btn btn-default button__fill--small` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) | 1px solid rgb(220, 220, 22 | 4px | 0px 16px | 14px | 36px | not_clicked(danger/external) |  |
| 저장하기 | `button__line button__fill--small button__fill--s` | rgb(30, 133, 255) | rgb(255, 255, 255) | 0px none rgb(255, 255, 255 | 4px | 0px 16px | 14px | 36px | not_clicked(danger/external) |  |
| 이름 | `form-label` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 0px | 14px | 19.5938px | no_visible_change |  |
| 아이디 | `form-label` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 0px | 14px | 19.5938px | no_visible_change |  |
| 전화번호 | `form-label` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 0px | 14px | 19.5938px | no_visible_change |  |
| 비밀번호 | `form-label pr-40 pt-24` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 24px 40px 0px 0px | 14px | 43.5938px | changed → 펼침/갱신 | act_08.png |

## pages_center_paper_favorite_cshtml  (25 buttons)

| 텍스트 | 클래스 | 배경 | 글자 | 테두리 | 둥글기 | 패딩 | 글자크기 | 높이 | 결과 | 산출물 |
|---|---|---|---|---|---|---|---|---|---|---|
| 내 문제지 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:mypaper.cshtml | act_00.png |
| 즐겨찾기 | `nav-link active` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 4px | 0px 16px | 14px | 48px | no_visible_change |  |
| 공유 문제지 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:share.cshtml | act_02.png |
| 테마별 문제지 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:themecalculationpaper.cshtml | act_03.png |
| 휴지통 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:trash.cshtml | act_04.png |
| 문제지 즐겨찾기 | `nav-link active` | rgb(233, 243, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 32px | 0px 16px | 14px | 32px | no_visible_change |  |
| 문항 즐겨찾기 | `nav-link` | rgba(0, 0, 0, 0) | rgb(86, 86, 97) | 1px solid rgb(86, 86, 97) | 32px | 0px 16px | 14px | 32px | changed → 이동:favoriteQuestion.cshtml | act_06.png |
| 1년 | `btn period-btn` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 4px 0px 0px 4px | 0px 14px | 14px | 36px | no_visible_change |  |
| 6개월 | `btn period-btn` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 0px 4px 4px 0px | 0px 14px | 14px | 36px | no_visible_change |  |
| 초기화 | `btn-underline` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) | 0px none rgb(52, 52, 64) | 4px | 1px 6px | 14px | 21.5938px | not_clicked(danger/external) |  |
| 필터 저장 | `btn-underline` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) | 0px none rgb(52, 52, 64) | 4px | 1px 6px | 14px | 21.5938px | not_clicked(danger/external) |  |
| 검색 | `` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) |  | 0px | 0px 16px | 12px | 34px | no_visible_change |  |
| 초등 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 4px 0px 0px 4px | 0px 16px | 12px | 36px | changed → 펼침/갱신 | act_12.png |
| 중등 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 0px | 0px 16px | 12px | 36px | changed → 펼침/갱신 | act_13.png |
| 고등 | `` | rgb(255, 255, 255) | rgb(105, 105, 114) |  | 0px 4px 4px 0px | 0px 16px | 12px | 36px | no_visible_change |  |
| add
추가 | `btn-add-delete` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 4px | 0px | 14px | 20px | changed → 펼침/갱신 | act_15.png |
| 학생 배정 | `category-btns-item` | rgb(255, 255, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 16px | 14px | 36px | changed → 모달 | act_16.png, act_16_modal.html |
| 인쇄 | `category-btns-item` | rgb(255, 255, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 16px | 14px | 36px | not_clicked(danger/external) |  |
| 해제 | `category-btns-item` | rgb(255, 255, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 16px | 14px | 36px | changed → 모달 | act_18.png, act_18_modal.html |
| 엑셀다운 | `category-btns-item` | rgb(255, 255, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 16px | 14px | 36px | not_clicked(danger/external) |  |
| 문제지 만들기 | `button__line button__fill--medium button__fill--` | rgb(250, 49, 88) | rgb(255, 255, 255) | 0px none rgb(255, 255, 255 | 4px | 0px 16px | 14px | 36px | changed → iframe:makestudy.cshtml | act_20.png |
| Scroll to Top | `scrollToTop` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 4px | 1px 6px | 16px | 32px | click_error:Message: element click intercepted: Element <button class="s |  |
|  | `prev disabled` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 0px | 12px | 32px | click_error:Message: element click intercepted: Element <a href="javascr |  |
| 1 | `active` | rgb(255, 255, 255) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 4px | 0px | 12px | 32px | click_error:Message: element click intercepted: Element <a href="javascr |  |
|  | `next` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 0px | 12px | 32px | click_error:Message: element click intercepted: Element <a href="javascr |  |

## pages_center_paper_favoritequestion_cshtml  (16 buttons)

| 텍스트 | 클래스 | 배경 | 글자 | 테두리 | 둥글기 | 패딩 | 글자크기 | 높이 | 결과 | 산출물 |
|---|---|---|---|---|---|---|---|---|---|---|
| 내 문제지 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:mypaper.cshtml | act_00.png |
| 즐겨찾기 | `nav-link active` | rgba(0, 0, 0, 0) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 4px | 0px 16px | 14px | 48px | no_visible_change |  |
| 공유 문제지 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:share.cshtml | act_02.png |
| 테마별 문제지 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:themecalculationpaper.cshtml | act_03.png |
| 휴지통 | `nav-link` | rgba(0, 0, 0, 0) | rgb(105, 105, 114) | 0px none rgb(105, 105, 114 | 4px | 0px 16px | 14px | 48px | changed → 이동:trash.cshtml | act_04.png |
| 문제지 즐겨찾기 | `nav-link` | rgba(0, 0, 0, 0) | rgb(86, 86, 97) | 1px solid rgb(86, 86, 97) | 32px | 0px 16px | 14px | 32px | changed → 이동:favorite.cshtml | act_05.png |
| 문항 즐겨찾기 | `nav-link active` | rgb(233, 243, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 32px | 0px 16px | 14px | 32px | no_visible_change |  |
| 1년 | `btn period-btn` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 4px 0px 0px 4px | 0px 14px | 14px | 36px | no_visible_change |  |
| 6개월 | `btn period-btn` | rgb(255, 255, 255) | rgb(105, 105, 114) | 1px solid rgb(220, 220, 22 | 0px 4px 4px 0px | 0px 14px | 14px | 36px | no_visible_change |  |
| 검색 | `` | rgba(0, 0, 0, 0) | rgb(52, 52, 64) |  | 0px | 0px 16px | 12px | 34px | no_visible_change |  |
| 삭제 | `category-btns-item` | rgb(255, 255, 255) | rgb(30, 133, 255) | 1px solid rgb(30, 133, 255 | 4px | 0px 16px | 14px | 36px | not_clicked(danger/external) |  |
| 문항 즐겨찾기 만들기 | `button__line button__fill--medium button__fill--` | rgb(250, 49, 88) | rgb(255, 255, 255) | 0px none rgb(255, 255, 255 | 4px | 0px 16px | 14px | 36px | changed → iframe:favorite_edit.cshtml?folder_ | act_11.png |
| Scroll to Top | `scrollToTop` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 4px | 1px 6px | 16px | 32px | click_error:Message: element click intercepted: Element <button class="s |  |
|  | `prev disabled` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 0px | 12px | 32px | click_error:Message: element click intercepted: Element <a href="javascr |  |
| 1 | `active` | rgb(255, 255, 255) | rgb(30, 133, 255) | 0px none rgb(30, 133, 255) | 4px | 0px | 12px | 32px | click_error:Message: element click intercepted: Element <a href="javascr |  |
|  | `next` | rgba(0, 0, 0, 0) | rgb(51, 51, 51) | 0px none rgb(51, 51, 51) | 0px | 0px | 12px | 32px | click_error:Message: element click intercepted: Element <a href="javascr |  |

## pages_center_paper_mypaper_cshtml  (1 buttons)

| 텍스트 | 클래스 | 배경 | 글자 | 테두리 | 둥글기 | 패딩 | 글자크기 | 높이 | 결과 | 산출물 |
|---|---|---|---|---|---|---|---|---|---|---|
| 내 문제지 | `` | rgba(0, 0, 0, 0) | rgb(33, 37, 41) | 0px none rgb(33, 37, 41) | 0px | 0px | 16px | auto | changed → 펼침/갱신 | act_00.png |

## 버튼 스타일 종류 요약 (클래스 → 배경/글자/둥글기, 등장 수)

- `nav-link` bg=rgba(0, 0, 0, 0) color=rgb(105, 105, 114) radius=4px ×90
- `category-btns-item` bg=rgb(255, 255, 255) color=rgb(30, 133, 255) radius=4px ×29
- `a` bg=rgba(0, 0, 0, 0) color=rgb(33, 37, 41) radius=0px ×25
- `label` bg=rgb(255, 255, 255) color=rgb(105, 105, 114) radius=4px ×25
- `nav-link` bg=rgba(0, 0, 0, 0) color=rgb(30, 133, 255) radius=4px ×23
- `form-label` bg=rgba(0, 0, 0, 0) color=rgb(51, 51, 51) radius=0px ×20
- `line-clamp-1` bg=rgba(0, 0, 0, 0) color=rgb(52, 52, 64) radius=0px ×15
- `a` bg=rgba(0, 0, 0, 0) color=rgb(30, 133, 255) radius=0px ×15
- `btn-underline` bg=rgba(0, 0, 0, 0) color=rgb(52, 52, 64) radius=4px ×12
- `label` bg=rgb(255, 255, 255) color=rgb(105, 105, 114) radius=0px ×12
- `dashboard__status--card` bg=rgb(255, 255, 255) color=rgb(33, 37, 41) radius=4px ×9
- `button` bg=rgba(0, 0, 0, 0) color=rgb(52, 52, 64) radius=0px ×9
- `label` bg=rgb(255, 255, 255) color=rgb(105, 105, 114) radius=0px 4px 4px 0px ×9
- `scrollToTop` bg=rgba(0, 0, 0, 0) color=rgb(33, 37, 41) radius=4px ×8
- `prev` bg=rgba(0, 0, 0, 0) color=rgb(51, 51, 51) radius=0px ×8
- `active` bg=rgb(255, 255, 255) color=rgb(30, 133, 255) radius=4px ×8
- `btn` bg=rgb(255, 255, 255) color=rgb(105, 105, 114) radius=4px 0px 0px 4px ×7
- `btn` bg=rgb(255, 255, 255) color=rgb(105, 105, 114) radius=0px 4px 4px 0px ×7
- `next` bg=rgba(0, 0, 0, 0) color=rgb(51, 51, 51) radius=0px ×7
- `link-button__more` bg=rgba(0, 0, 0, 0) color=rgb(33, 37, 41) radius=0px ×6
- `nav-link` bg=rgba(0, 0, 0, 0) color=rgb(86, 86, 97) radius=32px ×6
- `label` bg=rgb(255, 255, 255) color=rgb(105, 105, 114) radius=4px 0px 0px 4px ×6
- `label` bg=rgb(233, 243, 255) color=rgb(30, 133, 255) radius=4px ×6
- `button__line` bg=rgb(250, 49, 88) color=rgb(255, 255, 255) radius=4px ×6
- `btn-add-delete` bg=rgba(0, 0, 0, 0) color=rgb(33, 37, 41) radius=4px ×5
- `w-100` bg=rgb(255, 255, 255) color=rgb(105, 105, 114) radius=0px ×5
- `nav-link` bg=rgb(233, 243, 255) color=rgb(30, 133, 255) radius=32px ×4
- `btn` bg=rgba(0, 0, 0, 0) color=rgb(52, 52, 64) radius=4px ×4
- `label` bg=rgb(233, 243, 255) color=rgb(30, 133, 255) radius=4px 0px 0px 4px ×3
- `accordion-button` bg=rgb(255, 255, 255) color=rgb(59, 59, 71) radius=5px 5px 0px 0px ×3
- `w-100` bg=rgb(255, 255, 255) color=rgb(105, 105, 114) radius=4px 0px 0px 4px ×3
- `w-100` bg=rgb(255, 255, 255) color=rgb(105, 105, 114) radius=0px 4px 4px 0px ×3
- `category-btns-item` bg=rgb(30, 133, 255) color=rgb(255, 255, 255) radius=4px ×2
- `accordion-button` bg=rgb(255, 255, 255) color=rgb(59, 59, 71) radius=0px ×2
- `form-check-label` bg=rgba(0, 0, 0, 0) color=rgb(52, 52, 64) radius=0px ×2
- `button__fill` bg=rgba(0, 0, 0, 0) color=rgb(255, 255, 255) radius=4px ×1
- `btn` bg=rgb(255, 255, 255) color=rgb(105, 105, 114) radius=0px ×1
- `disabled` bg=rgba(0, 0, 0, 0) color=rgb(51, 51, 51) radius=0px ×1
- `label` bg=rgb(233, 243, 255) color=rgb(30, 133, 255) radius=0px ×1
- `button__fill` bg=rgb(255, 255, 255) color=rgb(33, 37, 41) radius=4px ×1