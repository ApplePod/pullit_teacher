import "react";

/** 원본 상단바가 쓰는 커스텀 엘리먼트 <profile-component> */
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "profile-component": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { class?: string };
    }
  }
}
