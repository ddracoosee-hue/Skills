# Run-plan template

Write one plan per run in `paths.handoff` before starting.

```markdown
## Run plan (YYYY-MM-DD)
Tasks (in order):
1. <task> — budget: <time>, <fix cycles>
2. <task> — budget: <time>, <fix cycles>
Stop conditions: <project stops plus run stops>
Checkpoints: <where the run must pause, or "none">
```

- One budget per task. Fix cycles default to `recheck.max_fix_cycles`. If it is null, propose an explicit default to the user, proceed only after they confirm it, and report the confirmed cap.
- Stop conditions: the project's stops plus anything that must halt
  this run (a missing file, a service that must stay untouched).
- Checkpoints: user approvals or handoffs the run must pause for.
