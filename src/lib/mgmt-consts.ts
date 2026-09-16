// 관리 화면 공용 상수 (서버 액션 아님 — "use server" 파일에서 상수 export 불가하여 분리)
export const MENU_PERMS: [string, string][] = [
  ["student", "학생"], ["sms", "홍보·문자"], ["teacher", "교사"], ["class", "반"],
  ["center", "교실"], ["payment", "수납"], ["settlement", "정산"], ["paper", "문제지 관리"],
  ["allclass", "전체 반 보기"], ["bygrade", "학년별 보기"], ["kmt", "전국학력평가"], ["bookorder", "교재주문관리"],
];
// 원본 학년 체계 그대로 (예비초 ~ 고3, 기타)
export const GRADE_OPTS: [string, string][] = [
  ["e0", "예비초"], ["e1", "초1"], ["e2", "초2"], ["e3", "초3"], ["e4", "초4"], ["e5", "초5"], ["e6", "초6"],
  ["m1", "중1"], ["m2", "중2"], ["m3", "중3"], ["h1", "고1"], ["h2", "고2"], ["h3", "고3"], ["etc", "기타"],
];
export const GRADE_LABEL: Record<string, string> = Object.fromEntries([...GRADE_OPTS, ["n", "N수"]]);
export const GRADE_BY_LABEL: Record<string, string> = Object.fromEntries(GRADE_OPTS.map(([v, l]) => [l, v]));
