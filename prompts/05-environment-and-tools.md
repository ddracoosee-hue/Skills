# Prompts: environment and tools (run before the first skill batch)

These prompts build what every skill batch depends on. Run them in order, Lane A (Standard), one
per message. Each one stops for your review.

| Step | What | When |
| --- | --- | --- |
| E0 | Verify the environment and fill in VERIFIED.md | First, before anything else |
| E1 | Build `tools/run_fixture` (the headless fixture harness) | After E0 |
| E2 | Prove the loop end to end on a throwaway skill | After E1 |
| E3 | Build `tools/trace_ledger.py` | After batch 1 (`core-trace-report` exists) |
| E4 | Optional hook appenders | Only if VERIFIED.md #22 (hooks schema) is verified |

Before E0, do one thing by hand: confirm the `Skills` repo visibility is what you want. It is
**public** right now. Change it at GitHub → Settings → General → Danger Zone → Change visibility.

---

## E0. Verify the environment (fills VERIFIED.md)

```text
Lane A. First run /models yourself and tell me the exact model strings; I will paste them back.
Task: verify the Muse Code facts in C:\Users\ddrac\muse-skills\VERIFIED.md on this PC and record
results. Work in a new worktree: git -C C:\Users\ddrac\muse-skills worktree add
C:\Users\ddrac\muse-skills-wt\env -b muse/skills-env origin/main. Do not change any project.

For each row 1–26 of VERIFIED.md, run the "How to check" command (or the closest safe equivalent),
and write the "Observed" cell as: <date> | <command> | <one-line result>. Never guess: if a check
cannot be done, write "could not check: <reason>".

Specific procedures:
- #6–#9: create a throwaway skill folder core-verify-probe (name + description only) in a temp
  folder; `muse skills validate` it; then add one optional frontmatter field at a time
  (allowed-tools, model, version) and record accept/reject; then add references/, scripts/,
  fixtures/, evals.md, CHANGELOG.md, TRIALS.md and record accept/reject. Install it with
  install.ps1 -Target <temp target> only if #6 shows which folder Muse reads; otherwise into a temp
  copy of the real target and remove it afterwards. Delete the probe at the end.
- #10: put core-verify-probe as both a user skill and a project skill (in a temp git repo) with
  different descriptions; record which one `muse skills inspect core-verify-probe` resolves.
- #13, #18: in a temp git repo, run one headless turn whose prompt file starts with
  /core-verify-probe; record the exact JSON event and field names that show the skill load.
- #14: give the probe a step "invoke /core-verify-probe-2"; record whether the second skill loads.
- #15, #16: after one session, record the session log folder and any environment variable or
  file that exposes the session id (names only, never values of secrets).
- #20: export the same session twice with identical flags; record whether the SHA-256 matches.
Record the Muse version at the top of VERIFIED.md. Fill "How results change the library" with the
decisions that now apply. Commit only VERIFIED.md ("Verify Muse environment <date>"). Report the
table and stop.
```

---

## E1. Build the fixture harness

```text
Lane A. Build tools/run_fixture.ps1 (and tools/run_fixture.sh if VERIFIED.md #1 says WSL) in the
batch worktree muse/skills-env. Use only flags and behaviours VERIFIED.md marks verified; if a
needed one is unverified, stop and tell me which.

Usage: run_fixture -Skill <name> -Case <case> [-Runs 5] [-Model <string>] [-Lane A|B]
Behaviour:
1. Refuse to run if -Lane B and the skill's privacy scan fails (python tools/check_skills.py --scan
   on every file of the skill).
2. For each run: copy skills/<name>/fixtures/<case>/ to a new temp folder; git init; commit all;
   copy the draft skill folder into <temp>/.agents/skills/<name>/ (or <name>-draft per VERIFIED.md
   #10, rewriting name/heading/prompt.txt to match); confirm with `muse skills inspect` that the
   draft is resolved; trust the folder per VERIFIED.md #19.
3. Run `muse exec --model <model> --max-model-steps 60 --json --prompt-file prompt.txt` in the temp
   folder; save the JSON stream to trace/<name>/<case>/<run>.jsonl inside the batch worktree
   (git-ignored).
4. Run the case's verify script in the temp folder; pass = exit 0. Never use muse's exit code as
   the result.
5. Count model steps and approval events from the JSON stream (event names from VERIFIED.md #13),
   check that .agents/runs/<name>/ received exactly one run file with a Trace block (artifacts_ok).
6. For the first passing run, `muse export --last --redacted --out` and record its SHA-256.
7. Append one EVALS.csv row (columns from the header); print a one-line summary; delete temp folders.
Never pass --yolo or --no-session-log. Add trace/ to .gitignore.
Test the harness with a fixture whose verify script always fails (expect 0/1) and one that always
passes (expect 1/1), using a probe skill you delete afterwards. Commit the tools and .gitignore.
Report and stop.
```

---

## E2. Prove the loop end to end

```text
Lane A. In the muse/skills-env worktree, copy templates/SKILL.template.md to a throwaway skill
core-loop-probe whose job is: read .muse/project.json "name" from the fixture and write it into
its run file. Give it evals.md (3 T, 2 N), CHANGELOG.md, TRIALS.md, and fixtures/glimber/ (an
invented project named "Glimber" with .muse/project.json, AGENTS.md, prompt.txt, verify.py that
checks the run file contains "Glimber" and a filled Trace block).
Run R1 (check_skills + muse skills validate), R2a, R2b, R3 (run_fixture -Runs 5 on Lane B, then
-Runs 1 on Lane A) exactly as 01-REFINEMENT.md says. Report each stage's result and the EVALS.csv
rows. Then delete the probe skill and its EVALS.csv rows (keep the tools). Do not commit the probe.
Stop.
```

---

## E3. Build the trace ledger (after batch 1)

```text
Lane A. Build tools/trace_ledger.py (Python 3.10+, stdlib only) in a new worktree branch
muse/skills-ledger. Read the real formats first: one `muse export` JSON (field names in
VERIFIED.md #20 and #13) and the run files that core-trace-report writes (its SKILL.md Outputs and
Trace block). Do not guess any field name.
Usage: python tools/trace_ledger.py <project-root> [--exports <dir>] [--csv]
Output: one row per skill run found under <project-root>/.agents/runs/**: skill, version,
skills_sha, lane, model, session_id, started, gates (question -> answer), check result, export
file and its SHA-256 if present, and whether the export's session matches the run file's session.
Flag rows where the run file claims a lane that differs from the model in the export.
Test with synthetic run files and a redacted export in a temp folder. Commit, report, stop.
```

---

## E4. Optional hook appenders (only if VERIFIED.md #22 is verified)

```text
Lane A. Using only the hooks.json schema recorded in VERIFIED.md #22, write templates/hooks.json
that appends one JSON line to trace/hooks.jsonl on SessionStart, UserPromptSubmit, PreToolUse,
PostToolUse, PostToolUseFailure, SubagentStart, SubagentStop, Stop and SessionEnd. Each hook is a
single append command with no network access and no secrets (hooks run outside the sandbox).
Document in templates/hooks.README.md how a project opts in (copy to <project>/.muse/hooks.json,
start a new session; there is no reload command). Do not install it in any project. Commit, report,
stop.
```
