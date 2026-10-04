# Changelog: core-skill-authoring

## 0.3.0 — 2026-10-03 — tested
Foundation audit: encode the unchanged description as valid YAML; preserve hard dependencies;
include approved new-skill metadata in commits; preserve unrelated staged work; start revised
versions as draft instead of inheriting old test status. Because: TRIALS.md A20261003-authoring.
R1 and tooling regressions are recorded in the foundation audit report. R1 passes (checker
0/0, validate valid:true); fresh R2 round 1 (0.3.0) provisional (T 5/5, N 2/2 exercised, 1
deferred, zero misfires; re-run N2 when core-retro exists); fresh R3 trial passed first cycle
(throwaway hello plus a new approved name committed through the hook in a disposable clone).
No stable evaluator tag: bootstrap review accepted these results 2026-10-03. Because: evals.md
Results round 1 (0.3.0), TRIALS.md R3 fresh trial of 0.3.0.

## 0.2.0 — 2026-10-02 — tested
Passed R1 (checker 0 errors 0 warnings, validate valid:true), R2 (5/5 triggers; near-miss targets unbuilt, no misfire), R3 (3 cycles; 13 text fixes from trial findings).

## 0.1.0 — 2026-10-02 — draft
First version: build procedure, description rules, evals format, revise mode.
