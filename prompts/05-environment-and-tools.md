# Prompts: environment checks and optional tools

These prompts are supplements, based on [`docs/MUSE-REFERENCE.md`](../docs/MUSE-REFERENCE.md). The
skill batches in `README.md` do not depend on them. E0 is recommended before batch 1; the rest are
upgrades for when you want stronger evidence or an audit trail.

Muse runs in PowerShell on this PC, so every command below is PowerShell. Use Lane A (Standard),
one prompt per message. Each prompt stops for your review.

| Step | What | When |
| --- | --- | --- |
| E0 | Check the Muse facts in `VERIFIED.md` on this PC | Recommended, before batch 1 |
| E1 | Build `tools/run_fixture.ps1` (headless fixture runs, the optional part of R3) | When you want fixture evidence |
| E3 | Build `tools/trace_ledger.ps1` (one row per traced task) | After `core-trace-report` exists |
| E4 | Optional hook appenders | Only if VERIFIED.md #16 (hooks schema) is verified |

---

## E0. Check the Muse facts (fills VERIFIED.md)

```text
Lane A. I have run /models; the model strings are: <paste>.
Task: check the facts in C:\Users\ddrac\muse-skills\VERIFIED.md on this PC and record them. Work in
a new worktree: git -C C:\Users\ddrac\muse-skills worktree add C:\Users\ddrac\muse-skills-wt\env
-b muse/skills-env origin/main. Do not change any project.
For each row, run the "How to check" command (or the closest safe equivalent) in PowerShell and
fill "Observed" as: <date> | <command> | <one-line result>. If a check cannot be done, write
"could not check: <reason>". Never guess.
For rows 4, 5 and 7, use a throwaway skill core-verify-probe in a temp folder (name and
description only); add one optional frontmatter field at a time and record accept/reject; install
it with install.ps1 -Target <temp folder> only after row 4 shows which folder Muse reads, and
remove it afterwards. For row 13, export the same session twice and compare Get-FileHash results.
Record names only, never secret values. Commit only VERIFIED.md ("Check Muse facts <date>").
Report the table and stop.
```

---

## E1. Fixture harness (optional part of R3)

```text
Lane A. Build tools/run_fixture.ps1 in the muse/skills-env worktree. Use only flags VERIFIED.md
marks verified (rows 8, 13, 14, 15); if one is unverified, stop and tell me which.
Usage: .\tools\run_fixture.ps1 -Skill <name> -Case <case> [-Runs 5] [-Model <string>] [-Lane A|B]
For each run:
1. Refuse -Lane B unless node tools/check-skills.mjs --scan passes on every file of the skill.
2. Copy skills\<name>\fixtures\<case>\ to a new temp folder; git init; commit; copy the draft skill
   into <temp>\.agents\skills\<name>\; confirm with muse skills inspect that the draft is the one
   resolved (if a user skill of the same name wins, stop and report).
3. Run muse exec --model <model> --max-model-steps 60 --json --prompt-file prompt.txt in the temp
   folder; save the output to trace\<name>\<case>\<run>.jsonl (trace\ is git-ignored).
4. Run the case's verify.ps1 in the temp folder; pass = exit 0. Never use muse's exit code.
5. Append one row to EVALS.csv; print a one-line summary; delete the temp folder.
Never pass --yolo or --no-session-log. Test with one fixture that always fails and one that always
passes, using a probe skill you delete afterwards. Commit the tool. Report and stop.
```

---

## E3. Trace ledger (after `core-trace-report` exists)

```text
Lane A. Build tools/trace_ledger.ps1 in a new worktree branch muse/skills-ledger. Read the real
formats first: the reports core-trace-report writes (its SKILL.md) and one redacted muse export
(field names only from VERIFIED.md). Do not guess field names.
Usage: .\tools\trace_ledger.ps1 -Project <path> [-Csv]
Output: one row per trace report found in the project: date, lane, model, skills used, checks and
results, export file, its SHA-256, and whether the hash still matches the file on disk. Flag a
report whose stated lane is B in a Lane-A project (LANES.md).
Test with synthetic reports and a synthetic export in a temp folder. Commit, report, stop.
```

---

## E4. Optional hook appenders (only if VERIFIED.md #16 is verified)

```text
Lane A. Using only the hooks.json schema recorded in VERIFIED.md #16, write templates\hooks.json
that appends one JSON line to trace\hooks.jsonl on each verified hook event. Each hook is a single
PowerShell append with no network access and no secrets (hooks run outside the sandbox). Document
in templates\hooks.README.md how a project opts in (copy to <project>\.muse\hooks.json and start a
new session). Do not install it in any project. Commit, report, stop.
```
