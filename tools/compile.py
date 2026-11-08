#!/usr/bin/env python3
"""Compiles data/*.txt into dist/questions.js.

File format (one or more questions per file):
  # Name a Naruto character        <- starts a question
  @ Characters                     <- category
  Naruto Uzumaki | Naruto; Sasuke  <- answers split by ";", extra spellings by "|"
"""
import json, pathlib, sys

root = pathlib.Path(__file__).resolve().parent.parent
questions, cur = [], None
for f in sorted((root / "data").glob("*.txt")):
    for line in f.read_text().splitlines():
        line = line.strip()
        if not line:
            continue
        if line.startswith("#"):
            cur = {"q": line[1:].strip(), "c": "Misc", "a": []}
            questions.append(cur)
        elif line.startswith("@"):
            cur["c"] = line[1:].strip()
        else:
            for item in line.split(";"):
                parts = [p.strip() for p in item.split("|") if p.strip()]
                if parts and parts[0].lower() not in {a[0].lower() for a in cur["a"]}:
                    cur["a"].append(parts)

for i, q in enumerate(questions):
    q["id"] = i
total = sum(len(q["a"]) for q in questions)
(root / "dist").mkdir(exist_ok=True)
(root / "dist" / "questions.js").write_text("window.QUESTIONS=" + json.dumps(questions, ensure_ascii=False, separators=(",", ":")) + ";")
print(f"{len(questions)} questions, {total} answers (avg {total // max(1, len(questions))})")
if "-v" in sys.argv:
    for q in questions:
        print(f"{len(q['a']):4}  {q['q']}")
