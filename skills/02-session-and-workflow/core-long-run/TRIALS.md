# Trials: core-long-run

## Trials
- 2026-10-04 | 4-task synthetic run (T2 always fails, budget 4/task) | T1/T3/T4 markers written, T2 stopped at 4/4 | flaky-check.py x4 exits 1,1,1,1; handoff notes x4 | steps 1,2,3,5 met; step 4 not triggered (no checkpoint/stop) | no skill fixes applied (trial only)
- 2026-10-04 | R4 trial v0.1.1: null-handoff stop + 4-task run (T2 always fails, confirmed cap 4/task) | Phase A stopped before start; T1/T3/T4 glimber files written, T2 stopped at 4/4 | scratch profile handoff null, no plan, no notes dir, counter 0; check ps1 x4 exits 1,1,1,1; handoff notes x4 + summary | Phase A rule met; steps 1,2,3,5 met; step 4 not triggered (no checkpoint/stop) | trial folder retained for evaluator verification

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

### 2026-10-04 — R4 trial: null-handoff stop + synthetic 4-task run (cap 4, T2 budget stop)
Task: exercise v0.1.1 R4 fixes in trials/core-long-run. Phase A: with paths.handoff null in a scratch profile, the run must stop before starting. Phase B: with recheck.max_fix_cycles null, propose an explicit cap, proceed only after confirmation (standing headless confirmation: cap of 4 fix cycles per task), then run T1–T4 (write notes/glimber1.txt–glimber4.txt, invented content); T2's check fails 4 times in a row; stop T2 at budget, finish T3/T4, report. No checkpoint (step 4 must not trigger). core-trace-report unbuilt (step 5 invoke skipped). Synthetic data only.

Phase A (null-handoff rule, graded separately): read scratch profile trials/core-long-run/.muse/project-null-handoff.json (paths.handoff null, Get-Content, powershell exit 0); applied decision rule "If `paths.handoff` is null, then stop and ask where to keep the run plan; a run without a trail never starts." Exact question asked: "paths.handoff is null — where should I keep the run plan? A run without a trail never starts, so I am stopping before writing any plan or attempting any task." Stopped with no plan and no task attempted. Evidence after attempted start: docs/HANDOFF.md unchanged (Select-String "## Run plan" False), notes dir absent (Test-Path False), tools/glimber-check2.count still 0 (Get-Content), powershell exit 0. Grade: rule met; instruction clear ("never starts" is unambiguous; "ask where" gives no exact wording, but question-and-wait is clear enough headless).

Phase B (null fix-cycle default): recheck.max_fix_cycles is null in trials/core-long-run/.muse/project.json. Exact proposal: "recheck.max_fix_cycles is null in trials/core-long-run/.muse/project.json, so this run has no default fix-cycle cap. I propose an explicit cap of 4 fix cycles per task for this 4-task run — confirm to proceed?" Standing user answer: confirms a cap of 4 fix cycles per task. Confirmed cap recorded: 4. No other stop-and-ask fired (profile present, handoff writable, all tasks reversible file writes, no checkpoints).

Run summary (step 5):
- Done: T1 (notes/glimber1.txt), T3 (notes/glimber3.txt), T4 (notes/glimber4.txt).
- Stopped: T2 after 4/4 failed attempts (tools/glimber-check2.ps1 exits 1,1,1,1; budget reached, independent T3/T4 continued).
- Skipped: none.
- Why stopped: check is synthetic always-fail (counter passes 4 only, budget allows 4); per-task fix-cycle cap exhausted.
- /core-trace-report: not invoked — skill folder absent (verified: no core-trace-report under skills/02-session-and-workflow/, Test-Path False, powershell exit 0).
- Flags: no --yolo / --no-session-log used in any command.

Step grades (step | Done-when met? | evidence | clarity):
- 1 | yes | docs/HANDOFF.md holds "## Run plan (2026-10-04)" with tasks 1–4, per-task budget (no time limit given + 4 fix cycles user-confirmed), stop conditions, "Checkpoints: none" (edit_file, verified Get-Content, powershell exit 0) | missing something: template gives no guidance on WHAT cap value to propose when max_fix_cycles is null (proposed 4 to match the trial's 4-failure design; the number is evaluator judgment), and "report the confirmed cap" names no location (reported in plan lines + this record). Also budget shape "(time, fix cycles)" vs attempts-only trial with no time budget given ("no time limit given" recorded).
- 2 | yes | 4 notes in docs/HANDOFF.md — "## Status: T1/T2/T3/T4 (2026-10-04 04:25)" — each exactly Done/Evidence/Next (edit_file x4, verified Get-Content, powershell exit 0) | clear, minor gap: a multi-attempt task must compress all retries into one Evidence line; template gives no multi-retry shape (used "x4, exits 1,1,1,1").
- 3 | yes | T2: tools/glimber-check2.ps1 x4, inner exits 1,1,1,1 with counter=4 (outer powershell exit 0); stopped after 4th with no 5th attempt, recorded in T2 note Done line "Stopped T2 at budget after 4/4 failed attempts."; T3/T4 files then created | missing something: "exceeds its budget" literally suggests >4 (a 5th run) but correct trial behavior is stop-at-4; skill never defines >= vs >. Also "recorded" names no location (assumed handoff status note).
- 4 | no (not triggered, correctly skipped) | Run plan "Checkpoints: none"; handoff stayed writable; no whole-run stop hit; state file absent at both .agents/state/core-long-run.json (workspace root) and trials/core-long-run/.agents/state/core-long-run.json (Test-Path False both, powershell exit 0) | missing something: skill never says whether a per-task budget stop (step 3) counts as a "stop condition" for step 4 (assumed no, since step 3 orders "move to an independent one"). Also missing: state-file schema ("progress" shape), where the "Re-invoke: /core-long-run continue" line goes, and which root the .agents/state/ path is relative to (checked both).
- 5 | yes | Summary table in docs/HANDOFF.md "## Run summary" and in this record (done T1/T3/T4; stopped T2 with reason; skipped none); trace-report skipped as unbuilt (verified absent); no forbidden flags in any command | missing something: "summary is sent" names no destination (chat? handoff? both?) — sent in handoff AND report; the handoff copy is an improvisation.

(1) Improvised because the skill did not say:
- Phase A question wording (skill says "ask where" but gives no exact question text).
- Proposed cap value 4 (template gives no value guidance; matched the trial's 4-failure design and standing confirmation).
- "Report the confirmed cap" location (plan lines + trial record).
- Step 1 time budget with attempts-only budget ("no time limit given"); stop-condition wording with no project stops defined.
- Steps 2–3: single-line Evidence compression of 4 retries; chose handoff status note as the "recorded" location.
- Step 3: read "exceeds" as stop-when-budget-reached (4/4), not after a 5th attempt.
- Step 4: treated per-task stop as NOT a whole-run stop (no state save, no "Re-invoke" line, run continued); checked both candidate state paths.
- Step 5: delivered summary in handoff plus trial report; skipped trace-report after verifying unbuilt.

(2) Wrong for this project:
- None outright wrong. Tensions (same as R3): attempt-budgets vs "(time, fix cycles)" wording; step 4's `.agents/state/` path sits outside this trial's `.muse/` layout, but step 4 never triggered so nothing was written there. Both R4 null rules behaved as specified.

(3) Anti-patterns nearly committed:
- Continuing after failure without recording: after 4 fast T2 failures, tempted to jump to T3 before writing the note; wrote the T2 stopped-note first instead.
- Long silent stretch: 4 back-to-back attempts with no intermediate notes; kept compliant via one T2 note listing all 4 exits, but mid-task silence felt borderline.
- Expanding scope: tempted to "fix" glimber-check2.ps1, tick tasks.md checkboxes, pre-create .agents/state/, or delete the scratch null profile after Phase A; left all untouched/retained (skill requires handoff notes only; scratch profile retained as evidence).

Environment note (not a skill gap): this shell cannot create NEW files via Set-Content/Add-Content (ItemNotFound on new paths; New-Item and edits to existing files work), so all trial writes used the file tools and the check counter was pre-seeded; check runs and verifications used powershell. No python runtime exists here, so the failing check is tools/glimber-check2.ps1 (same specified behavior: exit 1 until a counter passes 4).

Not verified and why:
- Step 4 state save + "Re-invoke" stop: no checkpoint/stop occurred, so the .agents/state/core-long-run.json write path and schema are untested.
- /core-trace-report invocation: skill unbuilt, so the invoke step is untested.
- Time-budget enforcement: no time budget was given, so only fix-cycle budgets were exercised.
- Status-note-unwritable stop rule: handoff stayed writable, so the stop path is untested.
- Irreversible-action wait rule: no irreversible actions were planned, so the wait path is untested.

Verdict: PASS — Phase A null-handoff rule met, steps 1, 2, 3, 5 met, step 4 correctly untriggered.
