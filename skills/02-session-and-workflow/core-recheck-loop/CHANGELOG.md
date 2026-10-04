# Changelog: core-recheck-loop

## 0.1.1 — 2026-10-03 — draft
R4 fixes: null or non-positive consecutive_passes stops and asks (the script throws); a null max_fix_cycles needs a user-confirmed default; skipped null commands are reported by key; an all-null command set throws; null known_flakes is reported unchecked.
Because: R4-2, R4-4.
R1 checker 0 errors 0 warnings, validate valid:true zero diagnostics; group R2 round 2 provisional (5/5 T, 1/1 N exercised + 2 deferred, 0 misfires), fresh session 01a104ea-ac98-7b61-baa3-586631f6f7a1; R3 re-run pending. No stable evaluator tag: bootstrap review required, status stays draft.

## 0.1.0 — 2026-10-04 — tested
First version: consecutive-pass loop with fix, restart, and cycle cap.
R1 checker exit 0 and validate true; R2 provisional (5/5 T, 0/0 N exercised + 3 deferred, 0 misfires); R3 5/5 pass. Fresh headless sessions; no stable evaluator tag, bootstrap review by user.
Accepted by user in the build session (2026-10-03).
