# Changelog: core-phase-gate

## 0.1.1 — 2026-10-03 — draft
R4 fixes: null paths.tasks or paths.handoff stops and asks; a null approval phrase uses exactly "Approve, request changes, or cancel?" accepting only "Approve"; a null roadmap is reported skipped. New fresh R3 reaching steps 2-6 with a local --no-ff merge.
Because: R4-4, R4-5.
R1 checker 0 errors 0 warnings, validate valid:true zero diagnostics; group R2 round 2 provisional (5/5 T, 2/2 N exercised + 1 deferred, 0 misfires), fresh session 01a104ea-adb3-72f0-8768-53499567b485; R3 pass 6/6 on synthetic glimber (merge b082ec1), fresh session 01a104eb-2fe0-7382-bcbd-cc0b8d6851e0. No stable evaluator tag: bootstrap review required, status stays draft.

## 0.1.0 — 2026-10-04 — tested
First version: task ticks, gate checks, checkpoint, merge.
R1 checker exit 0 and validate true; R2 provisional (5/5 T, 2/2 N exercised + 1 deferred, 0 misfires); R3 pass (stopped at step 1, named T2). Fresh headless sessions; no stable evaluator tag, bootstrap review by user.
Accepted by user in the build session (2026-10-03).
