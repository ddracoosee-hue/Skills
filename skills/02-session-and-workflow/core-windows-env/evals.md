# Evals: core-windows-env

## Should trigger
- T1: "npm isn't recognised in the script"
- T2: "the env var didn't stick between commands"
- T3: "chromium keeps running after the audit"
- T4: "how do I link the models folder on windows?"
- T5: "the powershell command fails with a quoting error"

## Should not trigger
- N1: "is port 3010 free?" → `core-port-safety`
- N2: "set up the worktree" → `core-worktree`
- N3: "install python" → none

## Results
| Date | Round | Should trigger | Should not | Changed |
| --- | --- | --- | --- | --- |
| 2026-10-03 | 1 | 5/5 | 1/1 exercised, 2 deferred (N1 → none, target core-port-safety unbuilt; N2 → none, target core-worktree unbuilt) | none — provisional; fresh session 01a10473-cf32-75b3-aa50-208a5464178f, muse-spark-1.3, HEAD a6583f6; re-run N1 when core-port-safety exists, N2 when core-worktree exists |
