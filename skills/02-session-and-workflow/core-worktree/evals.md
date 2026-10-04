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
