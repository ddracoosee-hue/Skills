---
name: core-phase-gate
description: "Use when a phase's tasks are done and it must pass its gate: all tasks ticked, gate checks green, handoff written, user checkpoint approved, then merge. Not for single-task checks (use `core-recheck-loop`)."
---
# core-phase-gate

## Use when
- Phase 2 is finished; run the gate.
- Can we merge this phase now?
- The user approved the checkpoint; finish the phase.
- Check the phase is really complete before merging.
- Invoke as /core-phase-gate.
- Instructions in the prompt or AGENTS.md override this skill.

## Not for
- Checking one task → core-recheck-loop
- Writing the phase report → core-report-writer
- Pushing a branch → none
- Committing phase work → core-commit

## Inputs
- `.muse/project.json`: `paths.tasks`, `paths.handoff`, `paths.roadmap`, `checkpoints.approval_phrase`, and the recheck keys the loop needs. If the file is missing, ask for /core-project-profile and stop.
- The phase id and its task list.
- The user's checkpoint reply, when the phase has a checkpoint.

## Steps
1. Confirm every task in the phase is ticked in `paths.tasks`. Done when: none unticked, or the unticked tasks are named and the gate stops.
2. Run /core-recheck-loop with all of the phase's new tests as the focused set. Done when: the loop reports its required consecutive passes.
3. Run the extra checks listed at the top of the phase in `paths.tasks`. Done when: each exits 0.
4. Write the dated phase section in `paths.handoff`: scope, commits, checks with observed results, anything unavailable, next action. Done when: the section exists with today's date.
5. If the phase has a user checkpoint: read references/checkpoint-procedure.md, save progress to `.agents/state/core-phase-gate.json`, end with "Re-invoke: /core-phase-gate continue", and STOP until the user writes the exact `checkpoints.approval_phrase`. Done when: state is saved and nothing continues past the checkpoint.
6. Merge per the project's rules: merge `--no-ff` from the main checkout, re-run the gate checks on the integration branch, remove the worktree. Never push. Done when: the merge commit exists and the worktree is removed.

## Decision rules
- If the checkpoint reply is silence or unclear, then it is never approval; keep waiting.
- If any gate check fails, then go back to the task; never merge partially.
- If roadmap steps match landed work, then tick only those; never tick for unmerged work.

## Anti-patterns
- Merging before the checkpoint is approved.
- Ticking tasks that didn't pass.
- Running the gate on a stale build.

## Evidence to report
- Each gate check with its exit code.
- The handoff section title.
- The checkpoint approval quote, when there is a checkpoint.
- The merge commit.
- Anything not verified and why.

## References
- [references/checkpoint-procedure.md](references/checkpoint-procedure.md): the user-checkpoint steps, generalised.
- Related: core-recheck-loop, core-commit, core-worktree, core-report-writer.
- Sources: phase gate (textclone tasks.md §G5); UI checkpoint (textclone tasks.md §G8); merge commands (textclone tasks.md §G2); profile keys (core-project-profile references/schema.md).
