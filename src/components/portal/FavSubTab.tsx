"use client";

import { useRouter } from "next/navigation";

/** 원본 즐겨찾기 화면의 2차 탭(ul.list-tab--3) — 문제지 즐겨찾기 / 문항 즐겨찾기 */
export function FavSubTab({ current }: { current: "paper" | "question" }) {
  const router = useRouter();
  return (
    <ul className="list-tab--3 mt-16" role="tablist">
      <li className="nav-item" role="presentation">
        <button className={`nav-link${current === "paper" ? " active" : ""}`} type="button" role="tab" aria-selected={current === "paper"}
          onClick={() => current !== "paper" && router.push("/paper/favorite")}>문제지 즐겨찾기</button>
      </li>
      <li className="nav-item" role="presentation">
        <button className={`nav-link${current === "question" ? " active" : ""}`} type="button" role="tab" aria-selected={current === "question"}
          onClick={() => current !== "question" && router.push("/paper/favoritequestion")}>문항 즐겨찾기</button>
      </li>
    </ul>
  );
}
