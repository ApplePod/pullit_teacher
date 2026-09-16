import React from "react";

/**
 * 캡처한 원본 HTML 을 '감싸는 div 없이' 렌더한다.
 * 원본 DOM 은 예를 들어 #contents > .contens-body 인데, dangerouslySetInnerHTML 을
 * 쓰면 #contents > div > .contens-body 로 한 겹이 더 생겨 배치·선택자가 달라진다.
 * 문자열의 루트 엘리먼트를 그대로 React 엘리먼트로 만들고 내부만 주입한다.
 */
function parseStyle(v: string): React.CSSProperties {
  const out: Record<string, string> = {};
  for (const part of v.split(";")) {
    const i = part.indexOf(":");
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    const val = part.slice(i + 1).trim();
    if (!k || !val) continue;
    out[k.startsWith("--") ? k : k.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = val;
  }
  return out as React.CSSProperties;
}

/** 루트 엘리먼트가 문자열 전체를 감싸는지 확인하고 [tag, attrs, inner] 반환 */
function splitRoot(html: string): [string, string, string] | null {
  const s = html.trim();
  const open = /^<([a-zA-Z][\w-]*)((?:\s[^>]*?)?)(\/?)>/.exec(s);
  if (!open) return null;
  const [full, tag, attrs, selfClose] = open;
  if (selfClose) return null;
  const re = new RegExp(`<${tag}\\b[^>]*?(/?)>|</${tag}\\s*>`, "gi");
  re.lastIndex = full.length;
  let depth = 1, m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (m[0].startsWith("</")) depth--;
    else if (!m[1]) depth++;
    if (depth === 0) {
      // 닫는 태그 뒤에 다른 내용이 있으면 루트가 아니다
      if (s.slice(m.index + m[0].length).trim() !== "") return null;
      return [tag, attrs, s.slice(full.length, m.index)];
    }
  }
  return null;
}

const ATTR_MAP: Record<string, string> = { class: "className", for: "htmlFor", colspan: "colSpan", rowspan: "rowSpan", tabindex: "tabIndex", readonly: "readOnly", maxlength: "maxLength", autocomplete: "autoComplete", frameborder: "frameBorder" };

export function RawHtml({ html, className, ...rest }: { html: string; className?: string; ref?: React.Ref<HTMLElement> } & Record<string, unknown>) {
  const root = splitRoot(html);
  if (!root) return React.createElement("div", { className, ...rest, dangerouslySetInnerHTML: { __html: html } });
  const [tag, attrs, inner] = root;
  const props: Record<string, unknown> = {};
  for (const a of attrs.matchAll(/([a-zA-Z_:][\w:.-]*)\s*=\s*"([^"]*)"/g)) {
    const raw = a[1].toLowerCase();
    if (raw.startsWith("on")) continue; // 원본 인라인 핸들러는 제외(React 에서 동작 안 함)
    const key = ATTR_MAP[raw] ?? raw;
    if (raw === "style") { const st = parseStyle(a[2]); if (Object.keys(st).length) props.style = st; continue; }
    props[key] = a[2];
  }
  if (className) props.className = [props.className, className].filter(Boolean).join(" ");
  return React.createElement(tag, { ...props, ...rest, dangerouslySetInnerHTML: { __html: inner } });
}
