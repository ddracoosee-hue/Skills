# Trials: core-long-run

## Trials
- 2026-10-04 | 4-task synthetic run (T2 always fails, budget 4/task) | T1/T3/T4 markers written, T2 stopped at 4/4 | flaky-check.py x4 exits 1,1,1,1; handoff notes x4 | steps 1,2,3,5 met; step 4 not triggered (no checkpoint/stop) | no skill fixes applied (trial only)

### 2026-10-04 — R3 trial: synthetic 4-task run (T2 budget stop)
Task: run tasks T1–T4 in trials/core-long-run/demo with budget 4 attempts/task; T2's check fails every time; stop T2 at budget, finish T3/T4, report. Synthetic data only.

Run summary (step 5):
- Done: T1 (notes/t1-done.txt), T3 (notes/t3-done.txt), T4 (notes/t4-done.txt).
- Stopped: T2 after 4/4 failed attempts (tools/flaky-check.py exits 1,1,1,1; budget reached, independent T3/T4 continued).
- Skipped: none.
- Why stopped: check is synthetic always-fail (print + sys.exit(1)); per-task budget exhausted.
- /core-trace-report: not invoked — skill folder absent (verified: no core-trace-report under skills/02-session-and-workflow/).
- Flags: no --yolo / --no-session-log used in any command.

Step grades (step | Done-when met? | evidence | clarity):
- 1 | yes | docs/HANDOFF.md holds "## Run plan (2026-10-04)" with tasks 1–4, per-task budget, stop conditions, "Checkpoints: none" (Add-Content, powershell exit 0) | missing something: budget shape is "(time, fix cycles)" but this run's budget is attempts (AGENTS.md: "Budgets are attempts per task"); no time budget was given so plan records "no time limit given". Also recheck.max_fix_cycles=3 in .muse/project.json conflicts with task budget 4; prompt override (4) was used but skill never states which budget wins vs project.json.
- 2 | yes | 4 notes in docs/HANDOFF.md — "## Status: T1 (2026-10-04 02:37)", T2/T3/T4 at 02:38 — each exactly Done/Evidence/Next (Add-Content x4, powershell exit 0) | clear, minor gap: a multi-attempt task must compress all retries into one Evidence line; template gives no multi-retry shape (used "x4, exits 1,1,1,1").
- 3 | yes | T2: `python tools/flaky-check.py` x4, script exits 1,1,1,1 (powershell exit 0 each); stopped after 4th, recorded in T2 note Done line "Stopped T2 at budget after 4/4 failed attempts."; T3/T4 markers then created | missing something: "exceeds its budget" literally suggests >4 (a 5th run) but correct trial behavior is stop-at-4; skill never defines >= vs >. Also "recorded" names no location (assumed handoff status note).
- 4 | no (not triggered, correctly skipped) | Run plan "Checkpoints: none"; handoff stayed writable; no whole-run stop hit; `.agents/state/core-long-run.json` correctly absent (Test-Path False, powershell exit 0) | missing something: skill never says whether a per-task budget stop (step 3) counts as a "stop condition" for step 4 (assumed no, since step 3 orders "move to an independent one"). Also missing: state-file schema ("progress" shape) and where the "Re-invoke: /core-long-run continue" line goes.
- 5 | yes | Summary table sent in trial report (done T1/T3/T4; stopped T2 with reason; skipped none); trace-report skipped as unbuilt (verified absent); no forbidden flags in any command | clear, minor gap: "summary is sent" names no destination (chat? handoff? both?) — sent in report only; skill never asks for the summary in the handoff.

(1) Improvised because the skill did not say:
- Step 1 time budget with attempts-only budget ("no time limit given"); stop-condition wording with no project stops defined; chose budget 4 over project.json max_fix_cycles 3 via prompt-override rule.
- Steps 2–3: single-line Evidence compression of 4 retries; chose handoff status note as the "recorded" location.
- Step 3: read "exceeds" as stop-when-budget-reached (4/4), not after a 5th attempt.
- Step 4: treated per-task stop as NOT a whole-run stop (no state save, no "Re-invoke" line, run continued).
- Step 5: delivered summary in the trial report; skipped trace-report after verifying unbuilt.

(2) Wrong for this project:
- None outright wrong. Tensions resolved by the skill's own override rule ("prompt or AGENTS.md override"): attempt-budgets vs "(time, fix cycles)" wording; budget 4 vs max_fix_cycles 3 (following the default 3 would have stopped T2 one attempt early — wrong for this trial). Step 4's `.agents/state/` path is outside this demo's project.json paths (demo uses `.muse/`), but step 4 never triggered so nothing was written there.

(3) Anti-patterns nearly committed:
- Continuing after failure without recording: after 4 fast T2 failures, tempted to jump to T3 before writing the note; wrote the T2 stopped-note first instead.
- Long silent stretch: 4 back-to-back attempts with no intermediate notes; kept compliant via one T2 note listing all 4 exits, but mid-task silence felt borderline.
- Expanding scope: tempted to "fix" flaky-check.py, tick tasks.md checkboxes, or pre-create .agents/state/; left all untouched (skill requires handoff notes only).

Not verified and why:
- Step 4 state save + "Re-invoke" stop: no checkpoint/stop occurred, so the .agents/state/core-long-run.json write path and schema are untested.
- /core-trace-report invocation: skill unbuilt, so the invoke step is untested.
- Time-budget enforcement: no time budget was given, so only attempt budgets were exercised.
