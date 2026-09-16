export const MANAGEMENT_TABS = [
  ["/management/student", "학생"],
  ["/management/class", "반"],
  ["/management/teacher", "교사"],
  ["/management/book", "교재등록"],
  ["/management/centerinfo", "교실설정"],
  ["/management/statistic", "학습현황"],
  ["/management/attendance", "출결"],
  ["/management/payment", "수납"],
  ["/management/sms", "문자"],
] as const;

export const PAPER_TABS = [
  ["/paper/mypaper", "내 문제지"],
  ["/paper/favorite", "즐겨찾기"],
  ["/paper/share", "공유 문제지"],
  ["/paper/theme", "테마별 문제지"],
  ["/paper/trash", "휴지통"],
] as const;

export const CLINIC_TABS = [
  ["/clinic/studentmark", "학생별 채점"],
  ["/clinic/class", "반별 채점"],
  ["/clinic/autobook", "교재매칭채점"],
  ["/clinic/report", "학습 분석 보고서"],
  ["/clinic/trash", "휴지통"],
] as const;
