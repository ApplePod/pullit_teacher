/**
 * 서버(UTC)와 브라우저(KST)가 같은 문자열을 만들도록 항상 한국 시간 기준으로 포맷한다.
 * 서버 렌더와 클라이언트 렌더가 달라지면 하이드레이션이 깨지므로 날짜 표기는 여기만 쓴다.
 */
const KST = "Asia/Seoul";
const parts = (v: string | Date) => {
  const d = typeof v === "string" ? new Date(v) : v;
  if (Number.isNaN(d.getTime())) return null;
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: KST, year: "numeric", month: "2-digit", day: "2-digit" });
  const [y, m, dd] = f.format(d).split("-");
  return { y, m, d: dd };
};
/** 26.09.16 (목록 등록일 표기) */
export function fmtShort(v?: string | null): string {
  if (!v) return "-";
  const p = parts(v); return p ? `${p.y.slice(2)}.${p.m}.${p.d}` : "-";
}
/** 2026-09-16 (input[type=date] 값) */
export function fmtISO(v: string | Date = new Date()): string {
  const p = parts(v); return p ? `${p.y}-${p.m}-${p.d}` : "";
}
/** 2026-09 (월 선택) */
export function fmtMonth(v: string | Date = new Date()): string {
  const p = parts(v); return p ? `${p.y}-${p.m}` : "";
}
