# Evals: core-skill-authoring

## Should trigger
- T1: "write a new skill that teaches you how we do commits"
- T2: "this skill is too long and messy, restructure it"
- T3: "make a skill for checking ports"
- T4: "turn our release checklist into a skill"
- T5: "add the evals and changelog that this skill is missing"

## Should not trigger
- N1: "check whether the commit skill fires when I ask to commit" → `core-skill-evals`
- N2: "the worktree skill missed something last week, update it from the log" → `core-retro`
- N3: "write a README for the textclone repo" → none

## Results
| Date | Round | Should trigger | Should not | Changed |
| --- | --- | --- | --- | --- |
| 2026-10-02 | 1 | 5/5 | 1/3 (N1,N2 → none; targets core-skill-evals, core-retro unbuilt, routing correct, no misfire) | none — re-run N1 at batch close, N2 when core-retro exists |
