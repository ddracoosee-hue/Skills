---
name: core-escalation
description: "Use when unsure whether to proceed or ask: the action is hard to reverse, outside the task's scope, visible outside the project, or blocked. Not for routine reversible edits inside scope (just proceed)."
---
# core-escalation

## Use when
- Should I just delete the old backups?
- This fix needs a change the task didn't mention.
- The task is blocked on something missing.
- Can I go ahead and push?
- Invoke as /core-escalation.
- Instructions in the prompt or AGENTS.md override this skill.

## Not for
- Routine reversible edits inside scope → none (just proceed)
- A loop that failed its cycles → core-recheck-loop
- Writing up a blocker for Codex → core-codex-handoff

## Inputs
- `.muse/project.json`: `paths.handoff`. If the file is missing, ask for /core-project-profile and stop.
- The action you are unsure about, and the task's scope.
- The project's stop conditions (from `paths.tasks` or `paths.rules`).

## Steps
1. Classify the action on the matrix in references/matrix.md. Done when: the cell is named.
2. If the cell says ask: send one decision-forcing question at a time, recommended option first. For approvals use exactly "Approve, request changes, or cancel?". Name the options, your recommendation, and what happens meanwhile. Done when: the question is sent.
3. Continue independent work; never sit idle unless everything depends on the answer. Done when: independent work continued or its absence is explained.
4. Record the open question in `paths.handoff`. Done when: the handoff names the question and what it blocks.

## Decision rules
- If a project stop condition applies, then stop; it always wins.
- If neither `paths.tasks` nor `paths.rules` names a source for stop conditions, then report stop conditions as unknown.
- If `paths.handoff` is null, then stop and ask where to record the open question.
- If the user approved a different task, then that approval does not carry to this one.
- If you only believe the user would agree, then that is not approval; ask.

## Anti-patterns
- Asking permission for routine edits.
- Asking vague questions ("how should I proceed?").
- Proceeding on an irreversible action because the user was away.

## Evidence to report
- The matrix cell.
- The question sent.
- What was done meanwhile.
- Anything not verified and why.

## References
- [references/matrix.md](references/matrix.md): the decision matrix with 2 examples per cell.
- Related: core-recheck-loop, core-codex-handoff, core-long-run.
- Sources: roles and asking rule (textclone AGENTS.md "Roles", "Read at the beginning of every session"); stop conditions (textclone tasks.md §G7); out-of-scope work (textclone plan.md §1).
