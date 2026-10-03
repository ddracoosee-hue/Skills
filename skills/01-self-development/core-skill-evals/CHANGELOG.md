# Changelog: core-skill-evals

## 0.3.0 — 2026-10-03 — draft
Foundation audit: include uncommitted/new skills in scope; distinguish catalog groups from
function categories; make the copied R2 prompt self-contained; bound evaluator recursion;
keep trial recording honest in read-only mode; route promotion through all gates using the
actual version. Because: TRIALS.md A20261003-evals and the prior R6 prompt/recursion findings.
R1 and tooling regressions are recorded in the foundation audit report. Fresh R2/R3 and
bootstrap acceptance for this revision remain pending; 0.2.1 acceptance is preserved below.

## 0.2.1 — 2026-10-02 — tested
Audit repair: one R2 policy with deferred/provisional verdicts mirrored in r2-prompt and results format; full R7 regression scope derived before testing; trusted-evaluator selection moved ahead of grading, repair, and promotion with a bootstrap-review bar on missing tags. R1 passes; fresh R2 round 3 (T 5/5, N 1/1 + 2 deferred, zero misfires) and a fresh R3 trial (steps 1-4 met, trial-internal tables corroborating, nested trials out of scope by the recursion bound) recorded 2026-10-02; bootstrap review accepted the bounded trials the same day. Corrects 0.2.0: its R2 rounds were provisional (N 1/1 exercised, N2/N3 deferred, not routed) — re-run N2 when core-retro exists and N3 when core-recheck-loop exists. Because: F19, F20 (isolated + fresh trials 2026-10-02), F21, F22.

## 0.2.0 — 2026-10-02 — tested
Passed R1 (checker 0/0, validate valid:true, both skills), R2 (5/5 triggers; near-miss targets unbuilt, no misfire), R3 (2 cycles; 2 text fixes from trial findings). No stable tag yet; user review at merge.

## 0.1.0 — 2026-10-02 — draft
First version: R1–R3 procedure, trigger and trial prompts, results formats.
