# Trials: core-handoff-writer

## Trials
- 2026-10-03 | ST1 synthetic handoff section | ran steps 1-5 in trials/core-handoff-writer/demo with 1 synthetic prior section; added dated ST1 section with completed/proposals separated |
  git diff -- docs/HANDOFF.md exit 0, numstat 16 additions 0 deletions | 5/5 steps met, 0 missed | no fixes, no status change |
  trial folder retained

  Trial: load skills/04-records-and-handoff/core-handoff-writer/SKILL.md, add dated handoff section for synthetic task ST1 covering completed changes and proposals; check diff shows only new section and proposals separated from completed changes. Synthetic data only.

  Section added (docs/HANDOFF.md):
  ## Trial ST1 (2026-10-03)
  - Scope: ST1 synthetic - add second line to src/notes.txt.
  - Branch: master; Worktree: trials/core-handoff-writer/demo; Commit: 4890d35 trial scaffolding; uncommitted diff of src/notes.txt.
  - Files changed: src/notes.txt.
  - Checks: git status --short exit 0 / git diff --stat exit 0 with exact outputs.
  - Findings / Limits / Next action present; Completed and Proposals in separate lists.
  Prior section ## Demo prior work (2026-10-03) kept intact including unresolved widget-count note.

  Step grades (step | Done-when met? | evidence | clear/wrong/missing):

  | Step | Done-when met? | Evidence | Instruction verdict |
  | --- | --- | --- | --- |
  | 1 | yes | Get-Content docs/HANDOFF.md exit 0 before edit; prior section and Unresolved widget-count note retained, verified by Select-String matches | clear |
  | 2 | yes | New header ## Trial ST1 (2026-10-03) at line 10; Get-Date yyyy-MM-dd 2026-10-03 | clear (minor gap: agent-name source unspecified; used Trial) |
  | 3 | yes | New section contains Scope, Branch+Worktree+Commit+uncommitted-diff note, Files changed, Checks with exact results, Findings, Limits, Next action (Select-String counts all >=1) | missing something: branch/worktree/commit vs or-clause ambiguous; no fallback specified when project.json commands are all null (used git checks) |
  | 4 | yes | - Completed: (Added line two...) separate from - Proposals: (two Propose... items); Select-String shows distinct headers, no crossover | clear |
  | 5 | yes | git diff -- docs/HANDOFF.md exit 0 shows only + lines for new section; --numstat 16 0 docs/HANDOFF.md | clear |

  (1) Improvised because skill did not say:
  - Step 2: agent name for trial context; used Trial.
  - Step 3: whether branch/worktree/commit are one item or three and whether the or-clause replaces or supplements; included all plus uncommitted-diff note.
  - Step 3: which checks count when no test/lint commands are configured; used git status --short and git diff --stat with exit codes and exact outputs.
  - Step 3: worktree format (full vs relative path); used relative trials/core-handoff-writer/demo to avoid personal data.
  - Step 5: exact diff invocation; used git diff -- docs/HANDOFF.md plus --numstat for count evidence.

  (2) Wrong for this project:
  - None blocking. Observation: full worktree path from git worktree list contains the OS username, which conflicts with the no-personal-data decision rule; skill does not specify a redacted/relative form, so used relative path.

  (3) Anti-patterns nearly committed:
  - Nearly wrote full worktree path with username (personal data in handoff); caught by decision rule and replaced with relative path.
  - Nearly left checks without exact commands; recorded command + exit 0 + exact output instead (avoids All-tests-pass-without-command).
  - Nearly left vague next action; wrote specific second look at widget count per prior unresolved note.
  - Test append added a stray blank line to the handoff; caught by diff check, restored via git checkout before the real edit, so final diff shows only the new section.
