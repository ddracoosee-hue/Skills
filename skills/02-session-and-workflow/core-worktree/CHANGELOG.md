# Changelog: core-worktree

## 0.1.1 — 2026-10-03 — draft
R4 fixes: the folder is built by substituting the slug into worktrees.root, never appended again; null worktrees.root, branch_pattern, setup_ref, or paths.handoff stops and asks.
Because: R4-3, R4-4.
R1 checker 0 errors 0 warnings, validate valid:true zero diagnostics; group R2 round 2 pass (5/5 T, 3/3 N), fresh session 01a104ea-ac0a-7bd1-b193-301dddb02d16; R3 re-run pending. No stable evaluator tag: bootstrap review required, status stays draft.

## 0.1.0 — 2026-10-04 — tested
First version: worktree create, setup, import check, record, and remove.
R1 checker exit 0 and validate true; R2 provisional (5/5 T, 1/1 N exercised + 2 deferred, 0 misfires); R3 7/7 pass. Fresh headless sessions; no stable evaluator tag, bootstrap review by user.
Accepted by user in the build session (2026-10-03).
