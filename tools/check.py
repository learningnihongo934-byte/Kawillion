#!/usr/bin/env python3
"""Flags likely duplicates inside each question: two answers that share a spelling once normalized."""
import json, re, subprocess, unicodedata, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
subprocess.run(["python3", str(root / "tools/compile.py")], check=True, capture_output=True)
Q = json.loads((root / "dist/questions.js").read_text()[len("window.QUESTIONS="):-1])
def squash(s):
    s = unicodedata.normalize("NFD", s.lower()); s = "".join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r"\bthe\b", " ", re.sub(r"[^a-z0-9 ]+", " ", s.replace("&", "and")))
    return re.sub(r"\s+", "", s).replace("ou", "o").replace("uu", "u")
bad = 0
for q in Q:
    seen = {}
    for i, alts in enumerate(q["a"]):
        for a in alts:
            k = squash(a)
            if k in seen and seen[k] != i:
                print(f"{q['q']}: '{a}' (#{i}) clashes with '{q['a'][seen[k]][0]}' (#{seen[k]})"); bad += 1
            seen.setdefault(k, i)
    for alts in q["a"]:
        if alts[0].rstrip().endswith("?") and not any(t in alts[0] for t in ("Kidding Me", "Do You Remember Love")):
            print(f"{q['q']}: unfinished entry '{alts[0]}'"); bad += 1
print(f"{bad} clashes")
