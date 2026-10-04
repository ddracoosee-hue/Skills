---
name: core-long-run
description: "Use when running unattended for a long stretch (a phase, a batch, overnight): set time and retry budgets, stop conditions and status notes. Not for one quick task, or for deciding a single ask-or-proceed (use `core-escalation`)."
---
# core-long-run

## Use when
- Run phase 3 overnight on your own.
- Work through these 8 tasks without me.
- Set yourself limits and run the backlog.
- Keep going through the task list until a checkpoint.
- Invoke as /core-long-run.
- Instructions in the prompt or AGENTS.md override this skill.

## Not for
- One quick task → none
- Deciding a single ask-or-proceed → core-escalation
- Summarising finished work → core-report-writer

## Inputs
- `.muse/project.json`: `paths.tasks`, `paths.handoff`, `recheck.max_fix_cycles`. If the file is missing, ask for /core-project-profile and stop.
- The task list for this run, in order, and the time budget the user gave.

## Steps
1. Before starting, write the run plan in `paths.handoff`: tasks in order, a budget per task (time, fix cycles), stop conditions, checkpoints. See references/run-plan-template.md. Done when: the plan is in the handoff.
2. After each task, write a 3-line status note in the handoff: done, evidence, next. See references/status-note-template.md. Done when: the note is in the handoff.
3. Check the budget after every failure. When a task exceeds its budget, stop that task and move to an independent one. Done when: the over-budget task is stopped and recorded.
4. At any checkpoint or stop condition: finish the status note, save the run plan's progress to `.agents/state/core-long-run.json`, end with "Re-invoke: /core-long-run continue", and stop. Done when: state is saved and the run stopped.
5. End-of-run summary: tasks done, stopped, skipped, and why; then invoke /core-trace-report when it is built. Never run with `--yolo` or `--no-session-log`: they erase the approval trail. Done when: the summary is sent.

## Decision rules
- If a task fails, then record every retry and never pass the budget silently.
- If one task stops, then independent tasks continue.
- If an action is irreversible, then it never runs unattended; it waits for the user.
- If the status note cannot be written (disk or permissions), then stop the run.

## Anti-patterns
- Continuing after a failure without recording it.
- Expanding scope mid-run.
- Long silent stretches with no status note.

## Evidence to report
- The run plan.
- The status notes.
- The summary table: done, stopped, skipped, and why.
- Anything not verified and why.

## References
- [references/run-plan-template.md](references/run-plan-template.md): the run-plan shape.
- [references/status-note-template.md](references/status-note-template.md): the status-note shape.
- Related: core-escalation, core-recheck-loop, core-phase-gate, core-trace-report.
- Sources: startup and stop conditions (textclone tasks.md §G1, §G7); fix-cycle cap (core-project-profile references/schema.md); approval-trail flags (LANES.md).
