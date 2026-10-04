# Evals: core-commit

## Should trigger
- T1: "commit this fix"
- T2: "save the work in git with a proper message"
- T3: "stage only the files for this task and commit"
- T4: "make the commit for task P2.3"
- T5: "check nothing private is in this commit and commit it"

## Should not trigger
- N1: "push the branch" → none
- N2: "merge phase 1 into master" → `core-phase-gate`
- N3: "write the release notes" → `core-release`

## Results
| Date | Round | Should trigger | Should not | Changed |
| --- | --- | --- | --- | --- |
| 2026-10-04 | 1 | 5/5 | 1/1 exercised, 2 deferred | none — provisional; reruns: N2→core-phase-gate, N3→core-release |
| 2026-10-03 | 2 | 5/5 | 2/2 exercised, 1 deferred | R4-7 description fix — provisional (N2 newly exercised); fresh session 01a104ea-ad28-7353-adba-692dedff50fc, Lane A, HEAD a6dec9e + uncommitted R4 text; output trials/core-commit/r2-output-r4group.md; rerun: N3→core-release (observed none) |
| 2026-10-04 | 3 | 5/5 | 2/2 exercised, 1 deferred | none — provisional; batch close, fresh session 01a1052c-1c8d-78a2-b250-eaf7dc4202c6, Lane A, HEAD c4aabfa (skill text unchanged since); rerun: N3→core-release (observed none) |
