# Evals: core-project-profile

## Should trigger
- T1: "set up the muse profile for the orion repo"
- T2: "the commit skill doesn't know our test command, fix the project config"
- T3: "check that textclone's .muse file is still right after the port change"
- T4: "add the new known flake to the project settings"
- T5: "create the per-project config the shared skills read"

## Should not trigger
- N1: "update AGENTS.md with the new rule" → none
- N2: "which ports are free right now?" → `core-port-safety`
- N3: "start the textclone worktree" → `core-worktree`

## Results
| Date | Round | Should trigger | Should not | Changed |
| --- | --- | --- | --- | --- |
| 2026-10-02 | 1 | 5/5 | 1/3 (N2,N3 → none; targets core-port-safety, core-worktree unbuilt, routing correct, no misfire) | none — re-run N2/N3 when targets exist |
| 2026-10-02 | 2 | 5/5 | 1/3 (N2,N3 → none; targets core-port-safety, core-worktree unbuilt, routing correct, no misfire) | none — re-run N2/N3 when targets exist |
| 2026-10-02 | 3 | 5/5 | 1/1 exercised, 2 deferred (N2,N3 → none; targets core-port-safety, core-worktree unbuilt, routing correct, no misfire) | none — provisional; re-run N2/N3 when targets exist; fresh-context subagent round |
