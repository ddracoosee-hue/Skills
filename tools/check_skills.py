#!/usr/bin/env python3
"""Structure and safety check for Muse skills (refinement stage R1). Python 3.10+, stdlib only.

  python tools/check_skills.py                    check every skill under skills/
  python tools/check_skills.py skills/<name> ...  check these skills (plus overlap against the rest)
  python tools/check_skills.py --scan FILE ...     secret / personal-path scan only (pre-commit hook)

Exit 0 = no errors. Warnings never fail the run but must be read.
After this passes, also run `muse skills validate <skill-dir>` (Muse's own check).
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILLS = ROOT / "skills"

BUILTINS = {"plan", "grill", "grilling", "grill-with-docs", "taste", "threejs", "migrate"}
NAME_RE = re.compile(r"^(core|textclone|orion)-[a-z0-9]+(-[a-z0-9]+)*$")
SECTIONS = ["Purpose", "Trigger contract", "Inputs", "Procedure", "Gates", "Outputs", "Trace block",
            "Failure handling", "Do not"]
STATUSES = {"draft", "tested", "reviewed", "stable"}
GATE_QUESTION = "Approve, request changes, or cancel?"
DESC_MAX = 350
SKILL_LINES_WARN, SKILL_LINES_MAX = 150, 200

SECRET_RES = [
    (re.compile(r"BEGIN [A-Z ]*PRIVATE KEY"), "private key"),
    (re.compile(r"\bghp_[A-Za-z0-9]{20,}"), "GitHub token"),
    (re.compile(r"\bsk-[A-Za-z0-9_-]{20,}"), "API key"),
    (re.compile(r"\bAKIA[0-9A-Z]{16}\b"), "AWS key"),
    (re.compile(r"(?im)^\s*(META_API_KEY|[A-Z][A-Z0-9_]*_(KEY|TOKEN|SECRET))\s*=\s*\S+"), ".env-style secret"),
    (re.compile(r"data[\\/]+textclone\.db", re.I), "live database path"),
    (re.compile(r"[A-Za-z]:\\+Users\\+[^\\\s]+", re.I), "personal Windows path"),
    (re.compile(r"(?<![\w.])/(home|Users)/[a-z][\w.-]*"), "personal Unix path"),
    (re.compile(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", re.I), "email address"),
]
SECRET_ALLOW = re.compile(r"noreply@anthropic\.com")
DATE_RE = re.compile(r"\b20\d\d-\d\d-\d\d\b")
USE_RE = re.compile(r"\bUse (when|whenever|at|after|before|to|for)\b")
BOILER_RE = re.compile(r"Runs only when invoked by name\.?|Writes \S+")

errors: list[str] = []
warnings: list[str] = []


def err(skill: str, msg: str) -> None:
    errors.append(f"{skill}: {msg}")


def warn(skill: str, msg: str) -> None:
    warnings.append(f"{skill}: {msg}")


def parse_frontmatter(text: str) -> tuple[dict[str, str], str] | None:
    m = re.match(r"^---\r?\n(.*?)\r?\n---\r?\n", text, re.S)
    if not m:
        return None
    fields: dict[str, str] = {}
    key = None
    for line in m.group(1).splitlines():
        kv = re.match(r"^([A-Za-z_-]+):\s*(.*)$", line)
        if kv:
            key, val = kv.group(1), kv.group(2).strip()
            fields[key] = "" if val in (">", ">-", "|", "|-") else val.strip("\"'")
        elif key and line.startswith((" ", "\t")):
            fields[key] = (fields[key] + " " + line.strip()).strip()
    return fields, text[m.end():]


def scan_text(skill: str, label: str, text: str) -> None:
    for rx, what in SECRET_RES:
        for hit in rx.finditer(text):
            if SECRET_ALLOW.search(hit.group(0)):
                continue
            err(skill, f"{label} may contain a {what} ({hit.group(0)[:40]!r})")
            break


def section(body: str, name: str) -> str:
    m = re.search(rf"^## {re.escape(name)}\s*$(.*?)(?=^## |\Z)", body, re.M | re.S)
    return m.group(1) if m else ""


def words(s: str) -> set[str]:
    s = BOILER_RE.sub(" ", s)
    return set(re.findall(r"[a-z]{4,}", re.sub(r"`[^`]*`", " ", s.lower())))


def check_skill(d: Path) -> tuple[str, str] | None:
    name = d.name
    md = d / "SKILL.md"
    if not md.is_file():
        err(name, "SKILL.md missing")
        return None
    text = md.read_text(encoding="utf-8")
    parsed = parse_frontmatter(text)
    if not parsed:
        err(name, "no YAML frontmatter")
        return None
    fields, body = parsed

    if not NAME_RE.match(name) or len(name) > 64:
        err(name, "folder name must match (core|textclone|orion)-<kebab-case>, max 64 chars")
    if name in BUILTINS:
        err(name, "clashes with a bundled Muse skill")
    if fields.get("name") != name:
        err(name, f"frontmatter name {fields.get('name')!r} must equal the folder name")
    extra = sorted(set(fields) - {"name", "description"})
    if extra:
        err(name, f"frontmatter may hold only name and description until VERIFIED.md says otherwise (found {extra})")

    desc = fields.get("description", "")
    if not desc:
        err(name, "description missing")
    if len(desc) > DESC_MAX:
        err(name, f"description is {len(desc)} chars (max {DESC_MAX})")
    if not USE_RE.search(desc):
        err(name, 'description must state when to use it ("Use when / at / before / after / to / for …")')
    for need, why in (("Not for", "when not to use"), ("by name", "explicit invocation"),
                      (f".agents/runs/{name}/", "what it writes")):
        if need not in desc:
            err(name, f"description must state {why} (missing {need!r})")

    lines = text.count("\n") + 1
    if lines > SKILL_LINES_MAX:
        err(name, f"SKILL.md is {lines} lines (max {SKILL_LINES_MAX}; move detail to references/)")
    elif lines > SKILL_LINES_WARN:
        warn(name, f"SKILL.md is {lines} lines (target {SKILL_LINES_WARN})")
    if DATE_RE.search(body):
        err(name, "SKILL.md contains a date; keep the body stable (dates go in CHANGELOG.md)")

    head = re.search(r"^# (\S+) — v(\d+\.\d+\.\d+)\s*$", body, re.M)
    if not head or head.group(1) != name:
        err(name, f'first heading must be "# {name} — v<x.y.z>"')

    heads = re.findall(r"^## (.+?)\s*$", body, re.M)
    pos = -1
    for s in SECTIONS:
        if s not in heads:
            err(name, f'section "## {s}" missing')
        elif heads.index(s) < pos:
            err(name, f'section "## {s}" out of order')
        else:
            pos = heads.index(s)

    trig = section(body, "Trigger contract")
    if "by name" not in trig:
        err(name, "Trigger contract must say the skill runs only when invoked by name")
    if "override" not in trig:
        err(name, "Trigger contract must say explicit prompt / AGENTS.md instructions override the skill")

    steps = re.split(r"^\d+\.\s", section(body, "Procedure"), flags=re.M)[1:]
    if not steps:
        err(name, "Procedure has no numbered steps")
    for i, st in enumerate(steps, 1):
        if "Done when:" not in st:
            err(name, f'Procedure step {i} has no "Done when:"')

    gates = section(body, "Gates").strip()
    if not gates:
        err(name, "Gates section is empty (write the gate, or say none and why)")
    elif GATE_QUESTION not in gates and "approval_phrase" not in gates and "None" not in gates:
        err(name, f'Gates must use the exact question "{GATE_QUESTION}", the project approval_phrase, or "None: …"')
    if ".agents/state/" in body and "Re-invoke" not in body:
        err(name, "skill keeps state across turns but never tells the user the exact re-invoke command")

    if f".agents/runs/{name}/" not in section(body, "Outputs"):
        err(name, f"Outputs must name .agents/runs/{name}/<YYYYMMDD-HHMM>-<slug>.md")
    tb = section(body, "Trace block").lower()
    for need in ("version", "lane", "session", "command", "gate"):
        if need not in tb:
            err(name, f"Trace block must record {need}")

    for ref in set(re.findall(r"(references/[\w./-]+\.\w+)", body)):
        if not (d / ref).is_file():
            err(name, f"{ref} is referenced but does not exist")

    ev = d / "evals.md"
    if not ev.is_file():
        err(name, "evals.md missing")
    else:
        e = ev.read_text(encoding="utf-8")
        t = len(re.findall(r"^- T\d+:", e, re.M))
        n = len(re.findall(r"^- N\d+:.*→\s*(`[a-z0-9-]+`|none)", e, re.M))
        if t < 3:
            err(name, f'evals.md has {t} should-route lines (min 3, "- T1: ...")')
        if n < 2:
            err(name, f'evals.md has {n} must-not-load lines (min 2, "- N1: ... → `other`" or "→ none")')
        if not re.search(r"^## Results", e, re.M):
            err(name, 'evals.md needs a "## Results" section')

    cl = d / "CHANGELOG.md"
    if not cl.is_file():
        err(name, "CHANGELOG.md missing")
    else:
        first = re.search(r"^## (\d+\.\d+\.\d+) — (\d{4}-\d{2}-\d{2}) — ([a-z]+)", cl.read_text(encoding="utf-8"), re.M)
        if not first:
            err(name, 'CHANGELOG.md needs "## x.y.z — YYYY-MM-DD — <status>" entries, newest first')
        else:
            if first.group(3) not in STATUSES:
                err(name, f"status {first.group(3)!r} is not one of {sorted(STATUSES)}")
            if head and head.group(2) != first.group(1):
                err(name, f"heading version v{head.group(2)} != newest CHANGELOG version {first.group(1)}")

    fx = d / "fixtures"
    cases = [c for c in fx.iterdir() if c.is_dir()] if fx.is_dir() else []
    if not cases:
        (err if name.startswith("core-") else warn)(name, "no fixtures/<case>/ (required for core-* skills)")
    for c in cases:
        if (c / ".git").exists():
            err(name, f"fixtures/{c.name} contains .git; store plain files, the harness runs git init")
        if not (c / "prompt.txt").is_file():
            err(name, f"fixtures/{c.name}/prompt.txt missing")
        if not any((c / v).is_file() for v in ("verify.py", "verify.ps1", "verify.sh")):
            err(name, f"fixtures/{c.name} has no verify.py / verify.ps1 / verify.sh")

    for f in d.rglob("*"):
        if f.is_file() and f.suffix.lower() in {".md", ".txt", ".json", ".py", ".ps1", ".sh", ".ts", ".js", ".csv", ".yml", ".yaml", ""}:
            try:
                scan_text(name, str(f.relative_to(d)), f.read_text(encoding="utf-8"))
            except UnicodeDecodeError:
                pass
    return name, desc


def main(argv: list[str]) -> int:
    if argv[:1] == ["--scan"]:
        for f in argv[1:]:
            p = Path(f)
            if p.is_file():
                try:
                    scan_text(f, "file", p.read_text(encoding="utf-8"))
                except UnicodeDecodeError:
                    pass
        for e in errors:
            print(f"ERROR {e}")
        return 1 if errors else 0

    every = sorted(p for p in SKILLS.iterdir() if p.is_dir()) if SKILLS.is_dir() else []
    chosen = [Path(a).resolve() for a in argv] if argv else every
    results = [r for r in (check_skill(d) for d in chosen) if r]
    pool = dict(results)
    for d in every:
        if d.resolve() not in chosen:
            parsed = parse_frontmatter((d / "SKILL.md").read_text(encoding="utf-8")) if (d / "SKILL.md").is_file() else None
            if parsed:
                pool[d.name] = parsed[0].get("description", "")
    for a, da in results:
        for b, db in pool.items():
            if a == b or (b in dict(results) and b < a):
                continue
            wa, wb = words(da), words(db)
            j = len(wa & wb) / (len(wa | wb) or 1)
            if j >= 0.5:
                warn(a, f'description overlaps {b} (Jaccard {j:.2f}); sharpen "Use when" / "Not for"')

    for w in warnings:
        print(f"WARN  {w}")
    for e in errors:
        print(f"ERROR {e}")
    print(f"{len(chosen)} skill(s) checked: {len(errors)} error(s), {len(warnings)} warning(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
