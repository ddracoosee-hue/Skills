# Trials: core-recheck-loop

## Trials

- 2026-10-04 | Recheck loop on demo with tests/test_add.py focused | Ran loop per skill, fixed OFFSET 2→3, reached 3 consecutive clean passes | focused 3× exit 0 after 1× exit 1; unit 3× exit 0 after 1× exit 1; lint 3× exit 0 after 1× exit 1; git diff --check exit 0 | steps met 5/5, missed 0 | fix applied in trial demo only, no skill change | trial folder retained

### 2026-10-04 — Recheck loop trial (demo, focused tests/test_add.py)

Task: in the trial area core-recheck-loop, use the demo repo: run the
recheck loop with tests/test_add.py as the focused test. Record the counts.
Synthetic data only.

Inputs read:

- demo .muse/project.json: test_focused `python {tests}`,
  test_unit `python tests/unit/test_unit.py`, lint_py `python tools/lint.py`,
  web commands all null, web_dir null, recheck.consecutive_passes 3,
  recheck.max_fix_cycles 3, known_flakes [].
- Focused tests: tests/test_add.py (given by the trial task).

Runs (each command with its result):

- Cycle 1 (counter 0, before fix):
  - `python tests/test_add.py` → FAIL, exit 1,
    `AssertionError: expected 4, got 3`
  - `python tests/unit/test_unit.py` → FAIL, exit 1 (diagnostic),
    `AssertionError: expected 3, got 2`
  - `python tools/lint.py` → FAIL, exit 1 (diagnostic),
    `lint: OFFSET has the wrong value`
  - Failed cycles used: 1. Counter reset to 0.
- Fix: demoapp/__init__.py `OFFSET = 2` → `OFFSET = 3`
  (1 insertion, 1 deletion; root cause of all three failures).
- Pass 1: focused exit 0 (`focused: pass`), unit exit 0 (`unit: pass`),
  lint exit 0 (`lint: clean`). Counter 1.
- Pass 2: focused exit 0, unit exit 0, lint exit 0. Counter 2.
- Pass 3: focused exit 0, unit exit 0, lint exit 0. Counter 3.
- `git diff --check` → exit 0.
- Cycles used: 1 failed + 3 clean. Stopping reason: counter reached
  consecutive_passes (3); cap max_fix_cycles (3) not reached.
- Known flakes seen: none (known_flakes empty, no signature matched).
- Not verified: nothing material; every non-null check command ran each
  pass. Web commands skipped (all null). No commit made (out of scope:
  skill defers committing to core-commit).

Step grades:

| Step | Done-when met? | Evidence | Instruction verdict |
| --- | --- | --- | --- |
| 1 | yes | Focused list written down: tests/test_add.py | clear |
| 2 | yes | Counter reached 3 with zero failures: 3 passes × 3 commands, all exit 0 | clear; the `{tests}` substitution is documented only in references/loop-script.md, which the step links — sufficient |
| 3 | yes | After cycle-1 failure: counter reset to 0, diagnosed OFFSET from assertion + lint output, fixed, restarted loop | clear |
| 4 | yes | `git diff --check` exit 0 | clear |
| 5 | yes | Report names 1 failed cycle used and stopping reason (reached 3 consecutive passes, under cap 3); never ran past cap | clear |

(1) Steps improvised because the skill did not say:

- After the focused test failed in cycle 1, ran the remaining unit and
  lint commands for corroborating diagnosis. The loop script throws on
  the first failure, and step 3 says "diagnose the failure from its
  output" (singular); the extra runs were my choice, not instructed.
- "Pass/fail counts": the synthetic checks print one line each rather
  than numeric counts, so exit codes plus output lines were recorded
  as the counts.
- The focused list came from the trial task text; no preceding change
  existed to derive "tests this change added or touched" from.

(2) Instructions wrong for this project:

- None. The PYTHONPATH note and the web-commands branch were
  inapplicable (tests self-contain sys.path; web commands null) and
  the reference correctly says null commands are skipped.

(3) Anti-patterns nearly committed:

- Nearly stopped after the focused test passed post-fix (anti-pattern:
  "Running only the focused test and calling it stable"); ran the full
  unit suite plus lint on every pass instead.
- No non-consecutive counting and no re-run-without-change occurred.

Verdict: PASS — all 5 steps met, no skill change required.
CHANGELOG.md status untouched (still draft), per trial protocol.
