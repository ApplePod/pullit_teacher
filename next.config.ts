import type { NextConfig } from "next";

/**
 * 원본(IIS)은 URL 대소문자를 구분하지 않아 마크업에 /Assets, /Fonts 처럼 섞여 있다.
 * verbatim 마크업은 그대로 두고, 정적 자산 요청만 실제 폴더명으로 되돌린다.
 */
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/Assets/:path*", destination: "/assets/:path*" },
      { source: "/Fonts/:path*", destination: "/fonts/:path*" },
      { source: "/Upload/:path*", destination: "/upload/:path*" },
      { source: "/assets2/:path*", destination: "/Assets2/:path*" },
      { source: "/content/:path*", destination: "/Content/:path*" },
    ];
  },
};

export default nextConfig;
