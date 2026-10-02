# Results formats

## evals.md

```markdown
# Evals: <name>

## Should trigger
- T1: "<a request a user would really type>"
- T2: "…"

## Should not trigger
- N1: "<a near-miss request>" → `<the skill that should take it>`
- N2: "<a request no skill should take>" → none

## Results
| Date | Round | Should trigger | Should not | Changed |
| --- | --- | --- | --- | --- |
| <date> | 1 | 5/5 | 3/3 | <what changed, or none> |
```

Write the requests in different words from the description. Use at least
3 should-trigger and 2 should-not lines; aim for 5 and 3.

## TRIALS.md

```markdown
# Trials: <name>

## Trials
- <date> | <trial task in a few words> | <what was built or run> |
  <checks with exit codes> | <steps met, steps missed> | <fixes applied> |
  <trial folder deleted after verification>
```

One line per trial. Field-use entries go under a separate `## Field use`
heading once the skill is live. No private data anywhere.
