# R3 prompt: the trial run

Run this in a fresh session. The trial folder holds synthetic data only.
Delete it when the trial is recorded.

```text
Load the skill <name> from the batch worktree (skills/<category>/<name>/SKILL.md) and follow it exactly on
this task: <the trial task from the skill's prompt>.
Work only in <trial folder or worktree>. Synthetic data only.
After the task, grade every step of the skill: step number | Done-when met? (yes/no) | evidence
(command + exit code, file path, or quote) | was the instruction clear, wrong, or missing something?
Then list: (1) any step you had to improvise because the skill did not say, (2) any instruction that
was wrong for this project, (3) any anti-pattern you nearly committed.
Append the result to skills/<category>/<name>/TRIALS.md under "## Trials" with today's date. No private data.
```

Placeholders:

- `<name>`, `<category>`: the skill under test and its folder.
- `<the trial task from the skill's prompt>`: copy it verbatim.
- `<trial folder or worktree>`: a scratch folder outside the repo, or a
  project worktree; synthetic data only.

Pass: every `Done when` was met, and no improvised step changed the outcome.

On a failure: fix `SKILL.md` (or `references/`), re-run R1, and run the
trial again in a new session, at most 3 cycles. When it passes, add
`## 0.2.0 — <date> — tested` to `CHANGELOG.md`.
