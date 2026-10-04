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
