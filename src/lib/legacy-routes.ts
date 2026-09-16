/**
 * 원본 마크업에 남아 있는 .cshtml 경로를 우리 라우트로 연결한다.
 * (캡처 HTML 의 링크·onclick 을 원본 그대로 두면서도 404 가 나지 않게)
 */
const MAP: Record<string, string> = {
  "/pages/center": "/dashboard",
  "/pages/center/dashboard/index.cshtml": "/dashboard",
  "/pages/center/paper/mypaper.cshtml": "/paper/mypaper",
  "/pages/center/paper/favorite.cshtml": "/paper/favorite",
  "/pages/center/paper/favoritequestion.cshtml": "/paper/favoritequestion",
  "/pages/center/paper/share.cshtml": "/paper/share",
  "/pages/center/paper/trash.cshtml": "/paper/trash",
  "/pages/center/paper/theme.cshtml": "/paper/theme",
  "/pages/center/paper/themecalculationpaper.cshtml": "/paper/themecalculationpaper",
  "/pages/center/paper/themepaperforexam.cshtml": "/paper/themepaperforexam",
  "/pages/center/clinic/studentmark.cshtml": "/clinic/studentmark",
  "/pages/center/clinic/class.cshtml": "/clinic/class",
  "/pages/center/clinic/report.cshtml": "/clinic/report",
  "/pages/center/clinic/trash.cshtml": "/clinic/trash",
  "/pages/center/clinic/autobook.cshtml": "/clinic/autobook",
  "/pages/center/clinic/book.cshtml": "/clinic/book",
  "/pages/center/clinic/premiumbook.cshtml": "/clinic/premiumbook",
  "/pages/center/management/student.cshtml": "/management/student",
  "/pages/center/management/studentform.cshtml": "/management/studentform",
  "/pages/center/management/class.cshtml": "/management/class",
  "/pages/center/management/teacher.cshtml": "/management/teacher",
  "/pages/center/management/attendance.cshtml": "/management/attendance",
  "/pages/center/management/book.cshtml": "/management/book",
  "/pages/center/management/statistic.cshtml": "/management/statistic",
  "/pages/center/management/individualstdbooks.cshtml": "/management/individualstdbooks",
  "/pages/center/management/centerinfo.cshtml": "/management/centerinfo",
  "/pages/center/management/payment.cshtml": "/management/payment",
  "/pages/center/management/sms.cshtml": "/management/sms",
  "/pages/center/mypage/profile.cshtml": "/mypage/profile",
  "/pages/center/mypage/calculate.cshtml": "/mypage/calculate",
  "/pages/center/help/notice.cshtml": "/help/notice",
  "/pages/center/help/faq.cshtml": "/help/faq",
  "/pages/center/help/dataroom.cshtml": "/help/dataroom",
  "/pages/center/help/11qna.cshtml": "/help/11qna",
  "/pages/center/help/errreport.cshtml": "/help/errreport",
  "/pages/center/premium/video.cshtml": "/premium/video",
  "/pages/center/premium/kmt.cshtml": "/premium/kmt",
  "/pages/center/premium/test/aimatch.cshtml": "/premium/test/aimatch",
  "/pages/center/premium/test/trash.cshtml": "/premium/test/trash",
  "/pages/center/premium/test/uploadpaper.cshtml": "/premium/test/uploadpaper",
  "/pages/center/premium/mathoperations/student.cshtml": "/premium/mathoperations/student",
  "/pages/center/login/login.cshtml": "/login",
  "/pages/center/login/findaccount.cshtml": "/forgot-password",
  "/pages/student": "/student",
  "/pages/student/": "/student",
  "/pages/common/tablet/attendance_login.cshtml": "/attendance-keypad",
};

/** 원본 경로면 우리 라우트를 반환 (대소문자 무시) */
export function mapLegacyPath(pathname: string): string | null {
  const key = pathname.toLowerCase().replace(/\/+$/, "") || "/";
  if (MAP[key]) return MAP[key];
  // 매핑에 없는 센터 페이지는 대시보드로
  if (key.startsWith("/pages/center")) return "/dashboard";
  if (key.startsWith("/pages/")) return "/dashboard";
  return null;
}
