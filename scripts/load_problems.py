"""
load_problems.py — 문항 전체 적재 (OPER-140). problem_code 기준 upsert 라서 멱등.

2026-09-17 문제은행 1단계 개편 반영
  - 수학 단답형(short_answer) 3,877개도 함께 넣는다. 예전에는 객관식만 넣어서 11,718 에서 멈춰 있었다.
    → 지금 총 15,595 (수학 9,858 + 영어 5,737)
  - 0009 마이그레이션의 answer_value(text) · glossary(jsonb) 를 payload 에 추가.
    원본 answer_value 는 정수라 text 컬럼에 맞춰 문자열로 변환한다.
  - ⚠ 영어는 difficulty 를 보내지 않는다. 영어 원본 JSONL 의 difficulty 는 전부 null 이라
    그대로 보내면 scripts/score_english_difficulty.py 가 채워 넣은 난이도를 통째로 지운다.
    영어 난이도는 그 스크립트가 유일한 출처다.
  - 학년·학기 컬럼과 concept_id 는 여기서 다루지 않는다.
    학년축은 scripts/backfill_grade_axis.py, concept_id 는 개념 정규화 작업 영역.

관련 스크립트
  load_short_answer.py       : 객관식이 이미 들어간 DB 에 단답형만 추가하는 델타 적재(같은 결과)
  backfill_grade_axis.py     : unit·problem 의 학년/학기 축 백필
  score_english_difficulty.py: 영어 난이도 산출
  verify_bank.py             : 적재 결과 검증
"""
import json, glob, urllib.request, time, sys
env=dict(l.split("=",1) for l in open("/Users/harry/Desktop/Claude_newlearn/pullit_teacher/.env.local").read().splitlines() if "=" in l and not l.startswith("#"))
URL=env["NEXT_PUBLIC_SUPABASE_URL"]; SR=env["SUPABASE_SERVICE_ROLE_KEY"]
BASE="/Users/harry/Desktop/Claude_newlearn"

def post(rows):
    # on_conflict=problem_code 필수. problem 의 PK 는 id(uuid) 라서 이 파라미터가 없으면
    # merge-duplicates 가 PK 기준으로만 동작해 재실행 시 409(중복 키)로 전부 실패한다.
    req=urllib.request.Request(f"{URL}/rest/v1/problem?on_conflict=problem_code", data=json.dumps(rows).encode(), method="POST",
        headers={"apikey":SR,"Authorization":f"Bearer {SR}","Content-Type":"application/json","Prefer":"resolution=merge-duplicates,return=minimal"})
    for attempt in range(4):
        try: urllib.request.urlopen(req,timeout=120); return None
        except urllib.error.HTTPError as e:
            body=e.read().decode()[:400]
            if attempt<3 and e.code>=500: time.sleep(2); continue
            return f"{e.code} {body}"
        except Exception as ex:
            if attempt<3: time.sleep(2); continue
            return str(ex)[:200]

def rows_from(pat, subject):
    for f in sorted(glob.glob(f"{BASE}/{pat}")):
        for line in open(f):
            line=line.strip()
            if not line: continue
            d=json.loads(line)
            av=d.get("answer_value")
            r={
                "problem_code":d["problem_code"], "subject":subject, "unit_code":d["unit_code"],
                "question":d["question"], "choices":d.get("choices"), "answer_type":d["answer_type"],
                "answer_index":d.get("answer_index"), "answer_text":d.get("answer_text"),
                "answer_value":None if av is None else str(av),
                "explanation":d.get("explanation"),
                "score":d.get("score"), "concept":d.get("concept"), "cognitive_stage":d.get("cognitive_stage"),
                "recommended_time_sec":d.get("recommended_time_sec"), "source_id":d.get("source_id"),
                "glossary":d.get("glossary"),
                "vocabulary":d.get("vocabulary"), "translation":d.get("translation"),
            }
            # 수학만 원본 난이도를 그대로 쓴다. 영어 난이도는 score_english_difficulty.py 소관.
            if subject=="math": r["difficulty"]=d.get("difficulty")
            yield r

total=0; errors=0; B=300
# PostgREST 대량 insert 는 한 요청 안의 행들이 같은 키 집합이어야 한다.
# 수학에만 difficulty 키가 있으므로 과목 경계에서 배치를 반드시 비운다.
def flush(batch):
    global total, errors
    if not batch: return []
    err=post(batch); total+=len(batch)
    if err: errors+=1; print(f"[ERR@{total}] {err}", flush=True)
    else: print(f"[{total}] ok", flush=True)
    return []

for subject,pat in [("math","수학문항_최신본/*.jsonl"),("english","영어문항_최신본/*.jsonl")]:
    batch=[]
    for r in rows_from(pat,subject):
        batch.append(r)
        if len(batch)>=B: batch=flush(batch)
    flush(batch)
print(f"DONE total={total} errors={errors}", flush=True)
