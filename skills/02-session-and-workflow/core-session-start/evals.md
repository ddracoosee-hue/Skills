# Evals: core-session-start

## Should trigger
- T1: "let's start working on textclone today"
- T2: "you got restarted, pick up where things are"
- T3: "before you change anything, get your bearings in this repo"
- T4: "new session, check the state of the project first"
- T5: "context was compacted, re-orient yourself"

## Should not trigger
- N1: "make a worktree for phase 2" → `core-worktree`
- N2: "write the handoff before you stop" → `core-handoff-writer`
- N3: "summarise the repo's architecture" → `textclone-codebase-map`

## Results
| Date | Round | Should trigger | Should not | Changed |
| --- | --- | --- | --- | --- |
| 2026-10-03 | 1 | 5/5 | 0/0 exercised, 3 deferred | none — provisional; reruns: N1→core-worktree, N2→core-handoff-writer, N3→textclone-codebase-map |
