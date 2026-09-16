import json, glob, urllib.request, time, sys
env=dict(l.split("=",1) for l in open("/Users/harry/Desktop/Claude_newlearn/pullit_teacher/.env.local").read().splitlines() if "=" in l and not l.startswith("#"))
URL=env["NEXT_PUBLIC_SUPABASE_URL"]; SR=env["SUPABASE_SERVICE_ROLE_KEY"]
BASE="/Users/harry/Desktop/Claude_newlearn"

def post(rows):
    req=urllib.request.Request(f"{URL}/rest/v1/problem", data=json.dumps(rows).encode(), method="POST",
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

def rows_from(pat, subject, only_mc):
    for f in sorted(glob.glob(f"{BASE}/{pat}")):
        for line in open(f):
            d=json.loads(line)
            if only_mc and d.get("answer_type")!="multiple_choice": continue
            yield {
                "problem_code":d["problem_code"], "subject":subject, "unit_code":d["unit_code"],
                "question":d["question"], "choices":d.get("choices"), "answer_type":d["answer_type"],
                "answer_index":d.get("answer_index"), "answer_text":d.get("answer_text"),
                "explanation":d.get("explanation"), "difficulty":d.get("difficulty"),
                "score":d.get("score"), "concept":d.get("concept"), "cognitive_stage":d.get("cognitive_stage"),
                "recommended_time_sec":d.get("recommended_time_sec"), "source_id":d.get("source_id"),
                "vocabulary":d.get("vocabulary"), "translation":d.get("translation"),
            }

total=0; errors=0; batch=[]; B=400
for subject,pat,mc in [("math","수학문항_최신본/*.jsonl",True),("english","영어문항_최신본/*.jsonl",False)]:
    for r in rows_from(pat,subject,mc):
        batch.append(r)
        if len(batch)>=B:
            err=post(batch)
            total+=len(batch)
            if err: errors+=1; print(f"[ERR@{total}] {err}", flush=True)
            elif total%2000==0: print(f"[{total}] ok", flush=True)
            batch=[]
if batch:
    err=post(batch); total+=len(batch)
    if err: errors+=1; print(f"[ERR@{total}] {err}", flush=True)
print(f"DONE total={total} errors={errors}", flush=True)
