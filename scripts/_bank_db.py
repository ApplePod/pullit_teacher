"""
_bank_db.py — 문제은행 적재/백필 스크립트 공용 유틸 (OPER-137 문제은행 구조 개편 1단계)

- .env.local 에서 키를 읽어온다. 키 값은 절대 출력하지 않는다.
- PostgREST(rest/v1) : 대량 upsert 용
- Management API      : SQL 실행 용 (백필·검증)
"""
import json
import time
import urllib.error
import urllib.request

REPO = "/Users/harry/Desktop/Claude_newlearn/pullit_teacher"
SRC = "/Users/harry/Desktop/Claude_newlearn"          # 문항 원본 JSONL 루트
PROJECT_REF = "afjdebkhukhhlpzbtxzu"                   # Supabase 프로젝트 ref

_env = dict(
    l.split("=", 1)
    for l in open(f"{REPO}/.env.local").read().splitlines()
    if "=" in l and not l.startswith("#")
)
URL = _env["NEXT_PUBLIC_SUPABASE_URL"].strip()
SERVICE_KEY = _env["SUPABASE_SERVICE_ROLE_KEY"].strip()
ACCESS_TOKEN = _env["SUPABASE_ACCESS_TOKEN"].strip()


def _request(req, timeout=180, retries=4):
    """5xx·네트워크 오류는 재시도. 실패하면 에러 문자열을 돌려준다(키는 노출되지 않음)."""
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                body = r.read().decode() or "null"
                return json.loads(body), None
        except urllib.error.HTTPError as e:
            msg = f"{e.code} {e.read().decode()[:400]}"
            if attempt < retries - 1 and e.code >= 500:
                time.sleep(2 * (attempt + 1))
                continue
            return None, msg
        except Exception as ex:                                   # noqa: BLE001
            if attempt < retries - 1:
                time.sleep(2 * (attempt + 1))
                continue
            return None, str(ex)[:200]
    return None, "retry exhausted"


def upsert(table, rows, on_conflict="problem_code"):
    """problem_code 기준 merge-duplicates upsert. 두 번 돌려도 행이 늘지 않는다."""
    req = urllib.request.Request(
        f"{URL}/rest/v1/{table}?on_conflict={on_conflict}",
        data=json.dumps(rows, ensure_ascii=False).encode(),
        method="POST",
        headers={
            "apikey": SERVICE_KEY,
            "Authorization": f"Bearer {SERVICE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=minimal",
        },
    )
    _, err = _request(req)
    return err


def sql(query):
    """Management API 로 SQL 실행. 반환은 (rows, err)."""
    req = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query",
        data=json.dumps({"query": query}).encode(),
        method="POST",
        headers={
            "Authorization": f"Bearer {ACCESS_TOKEN}",
            "Content-Type": "application/json",
        },
    )
    return _request(req)


def sql_or_die(query):
    rows, err = sql(query)
    if err:
        raise SystemExit(f"[SQL FAIL] {err}\n--- query ---\n{query[:800]}")
    return rows


def lit(v):
    """SQL 문자열 리터럴 이스케이프 (백필용 VALUES 목록 생성)."""
    if v is None:
        return "null"
    return "'" + str(v).replace("'", "''") + "'"


def table(rows, cols):
    """간단한 고정폭 표 출력 (검증 리포트용)."""
    if not rows:
        print("  (없음)")
        return
    w = {c: max(len(c), *(len(str(r.get(c, ""))) for r in rows)) for c in cols}
    print("  " + "  ".join(c.ljust(w[c]) for c in cols))
    print("  " + "  ".join("-" * w[c] for c in cols))
    for r in rows:
        print("  " + "  ".join(str(r.get(c, "")).ljust(w[c]) for c in cols))
