export const MANAGEMENT_TABS = [
  ["/management/attendance", "출결현황"],
  ["/management/statistic", "학습현황"],
  ["/management/student", "학생등록"],
  ["/management/book", "사용교재"],
  ["/management/teacher", "교사등록"],
  ["/management/class", "반 편성"],
  ["/management/centerinfo", "학원정보"],
] as const;

export const PAPER_TABS = [
  ["/paper/mypaper", "내 문제지"],
  ["/paper/favorite", "즐겨찾기"],
  ["/paper/share", "공유 문제지"],
  ["/paper/trash", "휴지통"],
] as const;
