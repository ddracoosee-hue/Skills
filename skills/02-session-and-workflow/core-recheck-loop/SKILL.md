---
name: core-recheck-loop
description: "Use after a change passes once: re-run the focused tests, unit suite and linters until N consecutive clean passes, fixing and restarting on any failure. Not for deciding whether a failure is flaky (use `core-flake-triage`)."
---
# core-recheck-loop

## Use when
- Make sure this fix is solid before we commit.
- The change passed once; now prove it's stable.
- Run the checks until they're consistently green.
- Do the recheck loop for this task.
- Invoke as /core-recheck-loop.
- Instructions in the prompt or AGENTS.md override this skill.

## Not for
- Deciding whether a failure is flaky → core-flake-triage
- Writing a test for a bug first → core-test-first
- Running the phase gate → core-phase-gate
- Committing the change → core-commit

## Inputs
- `.muse/project.json`: `commands.test_focused`, `commands.test_unit`, `commands.lint_py`, the web commands when web files changed, `recheck.consecutive_passes`, `recheck.max_fix_cycles`, `known_flakes`. If the file is missing, ask for /core-project-profile and stop.
- The focused tests: the tests this change added or touched.

## Steps
1. List the focused tests: the tests this change added or touched. Done when: the list is written down.
2. Run `commands.test_focused` with the focused tests, `commands.test_unit`, and `commands.lint_py` — plus the web commands when web files changed — until `recheck.consecutive_passes` consecutive clean passes. See references/loop-script.md for the loop shape. Done when: the counter reached consecutive_passes with zero failures.
3. On any failure: reset the counter to 0, diagnose the failure from its output, fix the cause, and restart the loop. Done when: the loop restarted at 0 after a fix.
4. After the loop passes: run `git diff --check`. Done when: it exits 0.
5. Stop after `recheck.max_fix_cycles` failed cycles and report; never run past the cap. Done when: the report names cycles used and the stopping reason.

## Decision rules
- If a failure matches a `known_flakes` signature, then record it and continue; never patch around it in this task.
- If a failure is in code you did not touch, then run /core-flake-triage before fixing anything.
- If a check fails, then never skip, xfail, or loosen an assertion to get green.

## Anti-patterns
- Counting non-consecutive passes toward the total.
- Running only the focused test and calling it stable.
- Re-running without changing anything and calling it fixed.

## Evidence to report
- Each run: the command with its pass/fail counts.
- Cycles used and the stopping reason.
- The known flakes seen, if any.
- Anything not verified and why.

## References
- [references/loop-script.md](references/loop-script.md): a PowerShell loop that reads the commands from project.json and throws on failure.
- Related: core-debug-method, core-flake-triage, core-test-first, core-phase-gate.
- Sources: the loop and known-flake note (textclone tasks.md §G4); commands table (textclone docs/AI_WORKFLOW.md "Commands and validation scope"); web checks (textclone web/AGENTS.md); profile keys (core-project-profile references/schema.md).
