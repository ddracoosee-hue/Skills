---
name: core-worktree
description: "Use when work needs its own git worktree and branch: create, set up its environment, verify it runs the right code, record it, remove it after merge. Not for committing (use `core-commit`) or merging a phase (use `core-phase-gate`)."
---
# core-worktree

## Use when
- Set up an isolated branch for this work.
- The tests in my worktree are running the wrong code.
- Clean up the worktree; the phase merged.
- Start this phase in its own folder.
- Invoke as /core-worktree.
- Instructions in the prompt or AGENTS.md override this skill.

## Not for
- Committing changes → core-commit
- Merging a phase → core-phase-gate
- Cloning a repo → none
- Session startup checks → core-session-start

## Inputs
- `.muse/project.json`: `worktrees.root`, `worktrees.branch_pattern`, `worktrees.setup_ref`, `paths.handoff`. If the file is missing, ask for /core-project-profile and stop.
- The setup steps at `worktrees.setup_ref` (a file#section). Read them before creating anything.
- The base: the project's integration branch unless the task names another.

## Steps
1. Name the branch from `worktrees.branch_pattern` and the folder under `worktrees.root`. Never reuse another agent's worktree or branch. Done when: the branch and folder names are written down and neither exists yet.
2. Create it: `git worktree add <root>\<slug> -b <branch> <base>`. Done when: `git worktree list` shows the new worktree.
3. Run the project's setup from `worktrees.setup_ref` inside the worktree. If a setup step is unclear, read references/windows-setup.md. Done when: every setup step ran without error.
4. Verify the code resolves inside the worktree. For Python: print the package path; the printed path must be inside the worktree. Otherwise STOP: the tests would validate the wrong code. Done when: the printed path is inside the worktree.
5. Run `git status --short` in the worktree. Every setup item must be ignored. If anything new shows up, stop: it would be committed. Done when: status shows nothing new.
6. Record the branch and folder in `paths.handoff`. Done when: the handoff names both.
7. After the merge: run `git worktree remove <folder>` from the main checkout. Never delete the branch until the user confirms. Done when: `git worktree list` no longer shows it.

## Decision rules
- If the task names no base, then use the project's integration branch.
- If another agent owns a worktree, then never reuse it; create your own.
- If setup makes an untracked file appear, then stop; it would be committed.
- If the setup uses `PYTHONPATH`, then set it in every command block; it does not persist.
- If the user has not confirmed branch deletion, then keep the branch after removing the worktree.

## Anti-patterns
- Testing in the worktree while Python imports the main checkout.
- Running pip install into a shared venv from a worktree.
- Creating worktrees inside the repo folder.
- Removing a worktree before its merge.

## Evidence to report
- The `git worktree list` line for the new worktree.
- The import-path check output.
- The `git status --short` output from the worktree.
- Anything not verified and why.

## References
- [references/windows-setup.md](references/windows-setup.md): the textclone setup block as a worked example, explained line by line.
- Related: core-session-start, core-project-profile, core-commit, core-phase-gate.
- Sources: worktree setup, checks, merge and remove (textclone tasks.md §G2); branch and worktree rules (textclone AGENTS.md "Branches and worktrees"); profile keys (core-project-profile references/schema.md).
