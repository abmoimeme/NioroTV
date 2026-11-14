#!/usr/bin/env python3
"""Manage NioroTV access codes.
  python make_code.py add "Fatou"           -> creates a code for Fatou and prints it
  python make_code.py add "AB" --admin      -> admin code (can see the GitHub Sync tab)
  python make_code.py list                  -> list names
  python make_code.py revoke "Fatou"        -> remove access
Only salted hashes are stored in codes.json; the plain code is shown once, here.
"""
import hashlib, json, os, secrets, sys

PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "codes.json")
ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"  # no 0/O/1/I/L

def load():
    if os.path.exists(PATH):
        return json.load(open(PATH, encoding="utf-8"))
    return {"salt": secrets.token_hex(16), "codes": []}

def save(d):
    json.dump(d, open(PATH, "w", encoding="utf-8"), indent=2)
    open(PATH, "a").write("\n")

def h(salt, code):
    return hashlib.sha256((salt + code.replace("-", "").replace(" ", "").upper()).encode()).hexdigest()

def main():
    a = sys.argv[1:]
    if not a: print(__doc__); return
    d = load()
    if a[0] == "add" and len(a) >= 2:
        raw = "".join(secrets.choice(ALPHABET) for _ in range(12))
        code = f"{raw[:4]}-{raw[4:8]}-{raw[8:]}"
        entry = {"name": a[1], "h": h(d["salt"], code)}
        if "--admin" in a: entry["admin"] = True
        d["codes"].append(entry); save(d)
        print(f"Code for {a[1]}: {code}")
    elif a[0] == "list":
        for c in d["codes"]: print(c["name"] + (" (admin)" if c.get("admin") else ""))
    elif a[0] == "revoke" and len(a) >= 2:
        n = len(d["codes"]); d["codes"] = [c for c in d["codes"] if c["name"] != a[1]]; save(d)
        print(f"Removed {n - len(d['codes'])} code(s) for {a[1]}")
    else: print(__doc__)

main()
