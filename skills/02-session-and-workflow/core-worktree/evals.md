# Evals: core-worktree

## Should trigger
- T1: "set up an isolated branch for the dictation work"
- T2: "make a separate checkout so we don't disturb master"
- T3: "the tests in my worktree are running the wrong code"
- T4: "clean up the worktree, phase 1 merged"
- T5: "start phase 3 in its own folder"

## Should not trigger
- N1: "commit these changes" → `core-commit`
- N2: "is the phase ready to merge?" → `core-phase-gate`
- N3: "clone the orion repo" → none

## Results
| Date | Round | Should trigger | Should not | Changed |
| --- | --- | --- | --- | --- |
| 2026-10-04 | 1 | 5/5 | 1/1 exercised, 2 deferred | none — provisional; reruns: N1→core-commit, N2→core-phase-gate |
| 2026-10-03 | 2 | 5/5 | 3/3 exercised, 0 deferred | R4 slug + null rules — pass; fresh session 01a104ea-ac0a-7bd1-b193-301dddb02d16, Lane A, HEAD a6dec9e + uncommitted R4 text; output trials/core-worktree/r2-output-r4group.md |
| 2026-10-04 | 3 | 5/5 | 3/3 exercised, 0 deferred | none — pass; batch close, fresh session 01a1052c-1c8d-78a2-b250-eaf7dc4202c6, Lane A, HEAD c4aabfa (skill text unchanged since) |
