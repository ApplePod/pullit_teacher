"use client";

import { Fragment, useRef, useState, useTransition } from "react";
import { metaAlert } from "@/components/portal/MetaModal";
import { saveCenter, type CenterOptions } from "./actions";
import type { Center } from "@/lib/types";

/** 원본 교실홈 학습 정보 기본값 (center.options 가 비어 있을 때) */
const DEFAULT_OPTIONS: CenterOptions = {
  ox: "Y", sox: "Y", oxpub: "N", 회차: "1", ori: "1", twin: "0", s001: "0", s002: "S", ch_btn_visible: "ON",
};

const RADIO = (name: string, items: [string, string][], value: string, onChange: (v: string) => void, cls = "filter-radio") => (
  <div className={cls}>
    {items.map(([v, label], i) => (
      <Fragment key={v}>
        <input type="radio" name={name} id={`${name}_${i}`} value={v} checked={value === v} onChange={() => onChange(v)} />
        <label htmlFor={`${name}_${i}`}>{label}</label>
      </Fragment>
    ))}
  </div>
);

/** 원본 교실설정(centerinfo.cshtml) 마크업 그대로 + 저장 동작 */
export function CenterForm({ center, readOnly, ownerName, email, phone, options }: {
  center: Center; readOnly: boolean; ownerName: string; email: string; phone: string; options: Partial<CenterOptions> | null;
}) {
  const [f, setF] = useState({
    name: center.name ?? "", owner_name: center.owner_name ?? "", tel: center.tel ?? "",
    address: center.address ?? "", slogan: center.slogan ?? "",
  });
  const [pw, setPw] = useState("");
  const [logo, setLogo] = useState<string | null>(center.logo_url ?? null);
  const [logoName, setLogoName] = useState("");
  const [reportStyle, setReportStyle] = useState((center.report_style ?? "v3").toLowerCase());
  // 원본 교실홈 학습 옵션 — center.options(jsonb) 에 저장
  const [opt, setOpt] = useState<CenterOptions>({ ...DEFAULT_OPTIONS, ...(options ?? {}) });
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const setOption = (k: keyof typeof opt) => (v: string) => setOpt({ ...opt, [k]: v });

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!/^image\/(png|jpeg)$/.test(file.type)) { metaAlert("1mb 이내 확장자명 jpg, png 파일만 업로드 가능해요."); e.target.value = ""; return; }
    if (file.size > 1024 * 1024) { metaAlert("1mb 이내 확장자명 jpg, png 파일만 업로드 가능해요."); e.target.value = ""; return; }
    const reader = new FileReader();
    reader.onload = () => { setLogo(String(reader.result)); setLogoName(file.name); };
    reader.readAsDataURL(file);
  };

  const submit = () => {
    start(async () => {
      const r = await saveCenter({ ...f, report_style: reportStyle, logo_url: logo, options: opt });
      if (r?.error) { await metaAlert(r.error); return; }
      await metaAlert(pw ? "저장되었습니다.\n교실홈(학생홈) 비밀번호 변경은 준비 중입니다." : (r?.message ?? "저장되었습니다."));
    });
  };

  return (
    <>
      <h3 className="section-title">교실 정보</h3>
      <div className="templete templete-add">
        <div className="row">
          <div className="col-6"><div className="form-group">
            <label htmlFor="className" className="form-label required">교실명</label>
            <input type="text" className="form-control" id="className" value={f.name} onChange={set("name")} disabled={readOnly} placeholder="교실명을 입력해주세요." />
          </div></div>
          <div className="col-6"><div className="form-group">
            <label id="classID" className="form-label">교실아이디</label>
            <p className="f-12 bw6">{center.id.slice(0, 8)}</p>
          </div></div>
          <div className="col-6"><div className="form-group">
            <label id="fromTel" className="form-label required">이메일</label>
            <p className="f-12 bw6">{email || "-"}</p>
          </div></div>
          <div className="col-6"><div className="form-group">
            <label htmlFor="classTel" className="form-label required">전화번호</label>
            <input type="tel" className="form-control" id="classTel" value={f.tel} onChange={set("tel")} disabled={readOnly} placeholder="02-000-0000" />
          </div></div>
          <div className="col-6"><div className="form-group">
            <label htmlFor="classPw" className="form-label">교실홈 새 비밀번호</label>
            <input type="password" name="password" className="form-control" id="classPw" placeholder="영문, 숫자 4-12자리"
              value={pw} onChange={(e) => setPw(e.target.value)} disabled={readOnly} />
            <div className="invalid-feedback">{"{HELP TEXT}"}</div>
          </div></div>
          <div className="col-6"><div className="form-group">
            <label htmlFor="classCEO" className="form-label">대표 선생님명</label>
            <input type="text" className="form-control" id="classCEO" value={f.owner_name} onChange={set("owner_name")} disabled={readOnly} placeholder={ownerName} />
          </div></div>
          <div className="col-6"><div className="form-group">
            <label id="classPhone" className="form-label required">휴대폰번호</label>
            <p className="f-12 bw6">{phone || "-"}</p>
          </div></div>
          <div className="col-6"><div className="form-group">
            <label htmlFor="inputAdd" className="form-label">주소</label>
            <div className="input-group gap-1">
              <input type="text" className="form-control" id="inputAdd" value={f.address} onChange={set("address")} disabled={readOnly} placeholder="주소를 입력해주세요." />
              <button type="button" className="btn btn-default" onClick={() => metaAlert("우편번호 검색은 준비 중입니다.")}>우편번호 검색</button>
            </div>
          </div></div>
        </div>
      </div>

      <h3 className="section-title mt-16">교실 표시 정보</h3>
      <div className="templete templete-add">
        <div className="d-flex gap-4">
          <div className="logo">
            <figure id="logoimgwrap" style={{ display: logo ? "block" : "none" }}>
              <button type="button" className="btn-close__photo" onClick={() => { setLogo(null); setLogoName(""); if (fileRef.current) fileRef.current.value = ""; }}>
                <i className="material-symbols-sharp">close</i>
              </button>
              {logo && <img id="centerlogoimg" src={logo} alt="로고" style={{ width: 236, height: 118 }} />}
            </figure>
          </div>
          <div className="form-group w-100 mb-0">
            <label htmlFor="addFile" className="form-label required">교실로고</label>
            <div className="form-file">
              <input type="file" id="addFile" className="file" accept="image/png,image/jpeg" ref={fileRef} onChange={onFile} disabled={readOnly} />
              <input placeholder="첨부파일" className="file-input" value={logoName} readOnly />
              <label htmlFor="addFile">첨부하기</label>
            </div>
            <ul className="explain-list mt-8">
              <li className="bw6">1mb 이내 확장자명 jpg, png 파일만 업로드 가능해요.</li>
              <li className="bw6">236x118px의 사이즈를 권장합니다.</li>
            </ul>
            <div className="form-group mt-24">
              <label htmlFor="taxName" className="form-label">슬로건</label>
              <input type="text" name="name" className="form-control" id="taxName" placeholder="슬로건을 입력해주세요" value={f.slogan} onChange={set("slogan")} disabled={readOnly} />
            </div>
            <div className="form-group">
              <ul className="explain-list mt-8">
                <li className="bw6">문제지 하단에 적용되는 문구예요.</li>
                <li className="bw6">25자 이내, 20글자가 넘으면 모바일에서 잘려 나올 수 있어요.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <h3 className="section-title mt-24">전자세금계산서 정보</h3>
      <div className="templete templete-add">
        <div className="row">
          <div className="col-6"><div className="form-group"><label className="form-label required">수신자명</label><p className="f-12 bw6">{f.owner_name || ownerName || "-"}</p></div></div>
          <div className="col-6"><div className="form-group"><label id="taxID" className="form-label">사업자 발행 정보</label><p className="f-12 bw6"></p></div></div>
          <div className="col-6"><div className="form-group"><label id="taxEmail" className="form-label required">수신자 이메일</label><p className="f-12 bw6">{email || "-"}</p></div></div>
          <div className="col-6"><div className="form-group"><label id="taxTel" className="form-label required">수신자 전화번호</label><p className="f-12 bw6">{f.tel || "-"}</p></div></div>
          <div className="col-6"><div className="form-group"><label id="taxPhone" className="form-label required">수신자 휴대폰번호</label><p className="f-12 bw6">{phone || "-"}</p></div></div>
        </div>
      </div>

      <h3 className="section-title mt-16">교실홈 학습 정보</h3>
      <div className="templete templete-add">
        <div className="row">
          <div className="col-6"><div className="form-group">
            <label className="form-label required">학생홈 오답출제 관리(학생이 직접 오답 출제)</label>
            {RADIO("ox", [["Y", "허용"], ["N", "미허용"]], opt.ox, setOption("ox"), "filter-radio w-100")}
            <p className="alert-orange mt-8">학생홈에서 학생이 선택할 수 있는 자동채점 문제지의 오답출제 버튼을 제어하는 옵션이에요.</p>
          </div></div>
          <div className="col-6"><div className="form-group">
            <label className="form-label required">학생답안 공개여부(자동채점 학생 입력답안)</label>
            {RADIO("sox", [["Y", "공개"], ["N", "비공개"]], opt.sox, setOption("sox"), "filter-radio w-100")}
            <p className="alert-orange mt-8">자동채점 문제지에서 학생이 입력한 답안을 채점결과에 공개여부를 선택하는 옵션이에요.</p>
          </div></div>
          <div className="col-12">
            <label className="form-label">오답출제 관리</label>
            <table className="table table-classRoom mb-0" style={{ borderRadius: 4 }}>
              <thead><tr>
                <th className="fw-700">오답 바로출제 기능</th><th className="fw-700">바로 출제 회차</th><th className="fw-700">원문항</th>
                <th className="fw-700">쌍둥이 문항</th><th className="fw-700">유사유형 문항</th>
              </tr></thead>
              <tbody><tr>
                <td>{RADIO("oxpub", [["Y", "ON"], ["N", "OFF"]], opt.oxpub, setOption("oxpub"))}</td>
                <td><div className="select__medium">
                  <select value={opt.회차} onChange={(e) => setOption("회차")(e.target.value)}>
                    <option value="1">1회차</option><option value="2">2회차</option><option value="3">3회차</option>
                  </select></div></td>
                <td>{RADIO("ori", [["0", "미생성"], ["1", "생성"]], opt.ori, setOption("ori"))}</td>
                <td>{RADIO("twin", [["0", "미생성"], ["1", "1배수"], ["2", "2배수"]], opt.twin, setOption("twin"))}</td>
                <td><div className="d-flex gap-1 flex-column">
                  {RADIO("s001", [["0", "미생성"], ["1", "1배수"], ["2", "2배수"]], opt.s001, setOption("s001"))}
                  {RADIO("s002", [["E", "쉬운"], ["S", "같은"], ["H", "어려운"]], opt.s002, setOption("s002"))}
                </div></td>
              </tr></tbody>
            </table>
            <p className="alert-orange mt-8 mb-16">학생이 자동채점 문제지 학습시 오답클리닉이 자동으로 출제되는 옵션이에요.</p>
          </div>
          <div className="col-6">
            <label className="form-label">분석표 디자인 설정</label>
            <table className="table table-classRoom mb-0" style={{ borderRadius: 4 }}>
              <tbody><tr><td>{RADIO("f_report_style", [["v3", "신규"], ["v2", "기존"]], reportStyle, setReportStyle, "filter-radio")}</td></tr></tbody>
            </table>
            <p className="alert-orange mt-8 mb-16">분석표의 디자인을 선택하는 옵션이에요.</p>
          </div>
          <div className="col-6">
            <label className="form-label">채널톡 상담 버튼</label>
            <table className="table table-classRoom mb-0" style={{ borderRadius: 4 }}>
              <tbody><tr><td>{RADIO("ch_btn_visible", [["ON", "ON"], ["OFF", "OFF"]], opt.ch_btn_visible, setOption("ch_btn_visible"))}</td></tr></tbody>
            </table>
            <p className="alert-orange mt-8 mb-16">화면 우측 하단의 채널톡 상담 버튼을 숨기거나 표시합니다.</p>
          </div>
        </div>
      </div>

      {!readOnly && (
        <div className="d-flex mt-16 justify-content-end">
          <button type="button" className="button__fill--red button__line--small" onClick={submit} disabled={pending}>
            <span className="material-symbols-sharp">done</span> 저장하기 </button>
        </div>
      )}
    </>
  );
}
