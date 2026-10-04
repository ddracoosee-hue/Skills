# Changelog: core-project-profile

## 0.3.0 — 2026-10-03 — tested
Foundation audit: separate create/check/update behavior; validate before writing; preserve
existing work; document nulls and non-web projects consistently; validate types, ranges,
paths, and executable resolution without running project commands. Because: TRIALS.md
A20261003-profile. The schema semantics changed, so R7 required fresh R3 for affected consumers
(authoring/evals, both passed with a schema-reading case) as well as profile, and full
Foundation-group R2. R1 passes (checker 0/0, validate valid:true); fresh R2 round 1 (0.3.0)
provisional (T 5/5, N 1/1 exercised, 2 deferred, zero misfires; re-run N2 when
core-port-safety exists, N3 when core-worktree exists); fresh R3 trial passed six synthetic
cases (create x2, check, update, invalid profile, dirty/occupied worktree); a read-only recheck
of both shipped examples under 0.3.0 rules passed (70 keys, 0 mismatches, 0 parse errors, 0
port overlaps). No stable evaluator tag: bootstrap review accepted these results 2026-10-03.
Earlier 0.2.1 acceptance is preserved below. Because: evals.md Results round 1 (0.3.0),
TRIALS.md R3 fresh trial of 0.3.0 and example recheck.

## 0.2.1 — 2026-10-02 — tested
Audit repair: orion commands rewritten for Windows PowerShell 5.1 with failure short-circuit (test_unit) and the web_dir rule (build_web); validation now requires every command to parse in PS 5.1 and states the one working directory per command class; voice port 8788 reconciled into orion owned and textclone forbidden with source citations (no schema shape change, so no R7 expansion). R1 passes; fresh R2 round 3 (T 5/5, N 1/1 + 2 deferred, zero misfires) and a fresh R3 trial (every value re-verified with line numbers, step 3 fully green, steps 4-6 identical to 0.2.0) recorded 2026-10-02; bootstrap review accepted the bounded trials the same day. Corrects 0.2.0: its R2 rounds were provisional (N 1/1 exercised, N2/N3 deferred, not routed) — re-run N2 when core-port-safety exists and N3 when core-worktree exists. Because: F16, F17, F18, F20 (isolated + fresh trials 2026-10-02).

## 0.2.0 — 2026-10-02 — tested
Passed R1 (checker 0/0, validate valid:true), R2 (5/5 triggers; near-miss targets unbuilt, no misfire), R3 (3 cycles; 11 fixes from trial findings). GUARDRAILS.md missing; ports sourced from .env.example + tasks.md G8 instead.

## 0.1.0 — 2026-10-02 — draft
First version: project.json schema, textclone and orion examples, validation.
