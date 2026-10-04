---
name: core-commit
description: "Use when committing work: stage by explicit path, write the project's commit format, check nothing private or unrelated is included. Not for pushing or merging (use `core-phase-gate`) or opening a worktree (use `core-worktree`)."
---
# core-commit

## Use when
- Commit this fix.
- Save the work in git with a proper message.
- Stage only the files for this task and commit.
- Check nothing private is in this commit and commit it.
- Invoke as /core-commit.
- Instructions in the prompt or AGENTS.md override this skill.

## Not for
- Pushing the branch → none
- Merging into another branch → core-phase-gate
- Writing release notes → core-release
- Opening a worktree → core-worktree

## Inputs
- `.muse/project.json`: `paths.private`, `paths.tasks`. If the file is missing, ask for /core-project-profile and stop.
- The project's commit format, from `paths.tasks` or `paths.rules`.
- The task this commit belongs to: which files are yours.

## Steps
1. Run `git status --short`. List your files and anything that is not yours. Done when: both lists are written down.
2. Stage each of your files by explicit path. Never `git add .`, `-A`, or wildcards. Done when: `git diff --cached --name-only` shows only your files.
3. Scan the staged content against `paths.private` and for secrets: `.env` values, tokens, keys, personal text, databases, logs. Use /core-privacy-guard when it is built; until then scan directly. Done when: every staged file passed and any hit stopped the commit.
4. Read the staged diff once, adversarially: every hunk belongs to this task. For a large change, review with /core-diff-self-review when it is built. Done when: the full diff was read and each hunk is wanted.
5. Read the commit format from `paths.tasks` (or `paths.rules`) and write the message in that format: summary first, then why and what. Done when: the message follows the format.
6. Commit and show `git log -1 --stat`. Done when: the log line shows the new commit.

## Decision rules
- If a file holds changes you did not write, then never stage it without asking.
- If unrelated formatting appears, then put it in its own commit or leave it out.
- If the fix belongs on someone else's commit, then make a new commit; never amend or rebase it.
- If the user did not ask to push in this task, then never push.
- If the project documents no commit format, then use one summary line (72 chars or fewer), a blank line, why, then what.

## Anti-patterns
- `git add -A` (or `.`, or wildcards).
- "fix stuff" messages with no reason given.
- Committing generated files, logs, or `.env`.

## Evidence to report
- The staged file list.
- The commit message.
- `git log -1 --stat`.
- Anything not verified and why.

## References
- Related: core-phase-gate, core-worktree, core-privacy-guard, core-diff-self-review.
- Sources: commit format and staging rules (textclone tasks.md §G6); privacy rules (textclone AGENTS.md "Project constraints to preserve"); profile keys (core-project-profile references/schema.md).
