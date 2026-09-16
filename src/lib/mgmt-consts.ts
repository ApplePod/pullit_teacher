// 관리 화면 공용 상수 (서버 액션 아님 — "use server" 파일에서 상수 export 불가하여 분리)
export const MENU_PERMS: [string, string][] = [
  ["student", "학생"], ["sms", "홍보·문자"], ["teacher", "교사"], ["class", "반"],
  ["center", "교실"], ["payment", "수납"], ["settlement", "정산"], ["paper", "문제지 관리"],
  ["allclass", "전체 반 보기"], ["bygrade", "학년별 보기"], ["kmt", "전국학력평가"], ["bookorder", "교재주문관리"],
];
export const GRADE_OPTS: [string, string][] = [["h1", "고1"], ["h2", "고2"], ["h3", "고3"], ["n", "N수"], ["etc", "기타"]];
export const GRADE_LABEL: Record<string, string> = { h1: "고1", h2: "고2", h3: "고3", n: "N수", etc: "기타" };
