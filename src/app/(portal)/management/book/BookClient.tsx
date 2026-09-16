"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ListTab } from "@/components/portal/ListTab";
import { MANAGEMENT_TABS } from "@/lib/nav";
import { GRADE_LABEL } from "@/lib/mgmt-consts";
import { listClassBookCards, type ClassBookCard } from "./bookActions";

export function BookClient() {
  const router = useRouter();
  const [list, setList] = useState<ClassBookCard[]>([]);
  const [page, setPage] = useState(1);
  const [pageView, setPageView] = useState(15);
  const [, start] = useTransition();

  useEffect(() => { start(async () => setList(await listClassBookCards())); }, []);

  const cnt = list.length;
  const totalPage = Math.max(1, Math.ceil(cnt / pageView));
  const pageRows = list.slice((page - 1) * pageView, page * pageView);

  /** 원본 doMngClassTextbook / doMngStdTextbook — MappingTextBooks.cshtml */
  const goMapping = (gid: string, gNm: string, reqKind: "group" | "student") =>
    router.push(`/management/book/mapping?gid=${gid}&reqKind=${reqKind}&gNm=${encodeURIComponent(gNm)}`);

  return (
    <>
      {/* 원본 #contents 안의 구버전 헤더(스타일시트에서 display:none) — DOM 구조 그대로 유지 */}
      <div className="contents-header">
        <div className="contents-header__wrap">
          <div className="left-area">
            <span className="material-symbols-sharp">manage_accounts</span>
            <h2>관리</h2>
          </div>
          <div className="right-area">
            <button type="button" className="button__line button__fill--medium button__fill--red">
              <i className="fa-sharp fa-regular fa-pencil-mechanical" aria-hidden="true"></i>문제지 만들기</button>
          </div>
        </div>
      </div>
      <div className="contens-body">
      <ListTab tabs={MANAGEMENT_TABS} />
      <div className="category-btns mt-24 mb-8">
        <div className="left-area"></div>
        <div className="right-area">
          <button type="button" className="button__line button__fill--medium button__fill--red"
            onClick={() => router.push("/management/individualstdbooks")}>개별 학생 사용 교재 관리</button>
          <button type="button" className="button__line button__fill--medium button__fill--red"
            onClick={() => router.push("/management/class")}>반 등록</button>
        </div>
      </div>

      <div className="card-grid-list card-grid-list--2">
        {pageRows.map((item) => (
          <div className="card" key={item.id}>
            <div className="card-head">
              <span className="grade badge__xsmall E67700">{item.grade ? GRADE_LABEL[item.grade] ?? item.grade : ""}</span>
              <span className="name">{item.name}</span>
            </div>
            <div className="card-body">
              <ul className="class-detail">
                <li><span className="title">학생</span><span className="data-set"><span className="p300">{item.student_cnt}명</span></span></li>
                <li><span className="title">반 공통 교재</span><span className="data-set"><span className="p300">{item.group_book_cnt}권</span></span></li>
                <li><span className="title">반 개별 교재</span><span className="data-set"><span className="p300">{item.group_student_book_cnt}권</span></span></li>
              </ul>
            </div>
            <div className="card-footer">
              <button type="button" className="button__fill button__line--small button__line--white bw10"
                onClick={() => goMapping(item.id, item.name, "group")}>반 별 교재 관리</button>
              <button type="button" className="button__fill button__line--small button__line--white bw10"
                onClick={() => goMapping(item.id, item.name, "student")}>학생별 교재 관리</button>
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex justify-content-between mt-16">
        <div className="d-flex align-items-center gap-2 f-14">
          총 {cnt}개 중
          <div className="select__small">
            <select value={pageView} onChange={(e) => { setPageView(Number(e.target.value)); setPage(1); }}>
              {[15, 30, 45, 60].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          개씩 보기
        </div>
        <button className="scrollToTop" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <i className="fa-sharp fa-light fa-arrow-up-to-line" aria-hidden="true"></i><span>Scroll to Top</span>
        </button>
        <div className="pagination"><div className="pagination__wrap">
          <a href="javascript:void(0);" className={`prev${page <= 1 ? " disabled" : ""}`} onClick={() => page > 1 && setPage(page - 1)}><i className="fa-light fa-angle-left" aria-hidden="true"></i></a>
          {Array.from({ length: totalPage }, (_, i) => i + 1).map((n) => (
            <a key={n} href="javascript:void(0);" className={page === n ? "active" : ""} onClick={() => setPage(n)}>{n}</a>
          ))}
          <a href="javascript:void(0);" className={`${page >= totalPage ? "disabled " : ""}next`} onClick={() => page < totalPage && setPage(page + 1)}><i className="fa-light fa-angle-right" aria-hidden="true"></i></a>
        </div></div>
      </div>
      </div>
    </>
  );
}
