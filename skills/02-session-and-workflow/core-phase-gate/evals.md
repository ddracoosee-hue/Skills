# Evals: core-phase-gate

## Should trigger
- T1: "phase 2 is finished, run the gate"
- T2: "can we merge this phase now?"
- T3: "the user approved the checkpoint, finish the phase"
- T4: "do everything needed to close out this phase"
- T5: "check the phase is really complete before merging"

## Should not trigger
- N1: "is this one task stable?" → `core-recheck-loop`
- N2: "write the phase report" → `core-report-writer`
- N3: "push master" → none

## Results
| Date | Round | Should trigger | Should not | Changed |
| --- | --- | --- | --- | --- |
| 2026-10-04 | 1 | 5/5 | 2/2 exercised, 1 deferred | none — provisional; rerun: N2→core-report-writer |
| 2026-10-03 | 2 | 5/5 | 2/2 exercised, 1 deferred | R4 null rules — provisional; fresh session 01a104ea-adb3-72f0-8768-53499567b485, Lane A, HEAD a6dec9e + uncommitted R4 text; output trials/core-phase-gate/r2-output-r4group.md; rerun: N2→core-report-writer (observed none) |
