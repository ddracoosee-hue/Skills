# Evals: core-recheck-loop

## Should trigger
- T1: "make sure this fix is solid before we commit"
- T2: "run the tests three times clean"
- T3: "the change passed once, now prove it's stable"
- T4: "do the recheck loop for this task"
- T5: "keep running the checks until they're consistently green"

## Should not trigger
- N1: "is this test failure just flaky?" → `core-flake-triage`
- N2: "write a test for this bug first" → `core-test-first`
- N3: "run the phase gate" → `core-phase-gate`

## Results
| Date | Round | Should trigger | Should not | Changed |
| --- | --- | --- | --- | --- |
| 2026-10-04 | 1 | 5/5 | 0/0 exercised, 3 deferred | none — provisional; reruns: N1→core-flake-triage, N2→core-test-first, N3→core-phase-gate |
| 2026-10-03 | 2 | 5/5 | 1/1 exercised, 2 deferred | R4 null guards — provisional (N3 newly exercised); fresh session 01a104ea-ac98-7b61-baa3-586631f6f7a1, Lane A, HEAD a6dec9e + uncommitted R4 text; output trials/core-recheck-loop/r2-output-r4group.md; reruns: N1→core-flake-triage, N2→core-test-first (both observed none) |
