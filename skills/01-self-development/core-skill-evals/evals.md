# Evals: core-skill-evals

## Should trigger
- T1: "does the dictation skill actually get picked when I ask about voice input?"
- T2: "run the trigger tests for everything in this batch"
- T3: "test whether core-commit works on a real commit"
- T4: "the new skills keep firing on the wrong things, check them"
- T5: "grade the worktree skill on a trial"

## Should not trigger
- N1: "write a skill for flaky tests" → `core-skill-authoring`
- N2: "update core-commit from what went wrong this week" → `core-retro`
- N3: "run the textclone unit tests" → `core-recheck-loop`

## Results
| Date | Round | Should trigger | Should not | Changed |
| --- | --- | --- | --- | --- |
| 2026-10-02 | 1 | 5/5 | 1/3 (N2,N3 → none; targets core-retro, core-recheck-loop unbuilt, routing correct, no misfire) | none — re-run N2/N3 when targets exist |
| 2026-10-02 | 2 | 5/5 | 1/3 (N2,N3 → none; targets core-retro, core-recheck-loop unbuilt, routing correct, no misfire) | none — re-run N2/N3 when targets exist |
| 2026-10-02 | 3 | 5/5 | 1/1 exercised, 2 deferred (N2,N3 → none; targets core-retro, core-recheck-loop unbuilt, routing correct, no misfire) | none — provisional; re-run N2/N3 when targets exist; fresh-context subagent round |
| 2026-10-03 | 1 (0.3.0) | 5/5 | 1/1 exercised, 2 deferred (N2,N3 → none; targets core-retro, core-recheck-loop unbuilt, routing correct) | none — provisional; fresh Muse session, HEAD 57ec25f, muse 1.4.2; re-run N2 when core-retro exists, N3 when core-recheck-loop exists |
