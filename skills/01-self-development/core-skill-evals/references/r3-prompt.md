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
If the task is read-only, return the complete record to the caller and mark saving it pending.
Report evidence and a verdict only; do not change CHANGELOG.md status from inside a trial.
```

Placeholders:

- `<name>`, `<category>`: the skill under test and its folder.
- `<the trial task from the skill's prompt>`: copy it verbatim.
- `<trial folder or worktree>`: a scratch folder outside the repo, or a
  project worktree; synthetic data only.

Pass: every `Done when` was met, and no improvised step changed the outcome.

On a failure: fix `SKILL.md` (or `references/`), re-run R1, and run the
trial again in a new session, at most 3 cycles. Return the results to the
evaluator's status step. Passing R3 alone never authorizes promotion: R1,
R2, comparison with the prior version, and the bootstrap gate still apply.
Use the actual version under test; never insert a fixed 0.2.0 entry.

## Trialing the evaluator itself

Do not recursively launch this evaluator's own R3 from inside its trial.
Exercise R1 and R2 on the named subjects, and exercise R3 orchestration on a
synthetic leaf skill whose job does not evaluate skills. Include a failing
case and a promotion attempt with missing evidence. Record every excluded
step as not exercised; an exclusion is not a pass. Keep the trial bounded
to one evaluator invocation and one leaf trial. Without a fresh session,
return partial evidence and the pending work; never grade your own edits
as an independent trial. Bootstrap acceptance must cite the bounded
coverage and come from the human reviewer.
