/** 아이디만 입력하면 내부 이메일 형식으로 변환 (예: admin → admin@pullit-teacher.local) */
export const ID_EMAIL_DOMAIN = "pullit-teacher.local";

export function toEmail(idOrEmail: string) {
  const v = idOrEmail.trim().toLowerCase();
  return v.includes("@") ? v : `${v}@${ID_EMAIL_DOMAIN}`;
}

/** 내부 도메인 이메일이면 아이디만 돌려줌 */
export function displayLoginId(email: string | undefined) {
  if (!email) return "";
  return email.endsWith(`@${ID_EMAIL_DOMAIN}`) ? email.split("@")[0] : email;
}
