# Trials: core-recheck-loop

## Trials

- 2026-10-04 | Recheck loop on demo with tests/test_add.py focused | Ran loop per skill, fixed OFFSET 2→3, reached 3 consecutive clean passes | focused 3× exit 0 after 1× exit 1; unit 3× exit 0 after 1× exit 1; lint 3× exit 0 after 1× exit 1; git diff --check exit 0 | steps met 5/5, missed 0 | fix applied in trial demo only, no skill change | trial folder retained
- 2026-10-04 | R4 null-passes stop-and-ask + recheck loop on demo-loop, focused tests/unit/test_glimber.py | Phase A stopped with pass-count question and ran nothing; Phase B fixed planted assert, reached 2 consecutive clean passes | cycle 1 focused exit 1 (2 passed, 1 failed); passes 1–2 focused 3/0, unit 5/0, lint clean, all exit 0; git diff --check exit 0; 1 failed cycle, cap 3 | steps met 5/5 + R4 rule PASS, missed 0 | fix applied in trial demo only, no skill change | trial folder retained for evaluator verification

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

### 2026-10-04 — R4 stop-and-ask + recheck loop trial (demo-loop, focused tests/unit/test_glimber.py)

Task: in a textclone worktree, run the loop on
tests/unit/test_errors_and_llm_utils.py as the focused test; record the
counts. Adaptation (no textclone checkout; synthetic data only): the
"project" is demo repo trials/core-recheck-loop/demo-loop (git init
-b master, one commit 0d8eead, synthetic identity trial-bot via per-command
-c flags only), with .muse/project.json, synthetic focused test
tests/unit/test_glimber.py, and second synthetic file
tests/unit/test_wobble.py for the unit suite. Lane A, model muse-spark-1.3,
skill version 0.1.1. Full contemporaneous log:
trials/core-recheck-loop/trial-log.md.

Inputs read:

- demo .muse/project.json: test_focused
  `node tools/run-focused.mjs {tests}`, test_unit
  `node tools/run-unit.mjs`, lint_py `node tools/lint.mjs`, web commands
  all null, web_dir null, known_flakes null. Phase A:
  recheck.consecutive_passes null, recheck.max_fix_cycles 3. Phase B:
  consecutive_passes 2 (uncommitted edit), max_fix_cycles 3.
- Probe (recorded before choosing commands): `python` not on PATH;
  `py` resolves to a WindowsApps binary that fails with Access denied
  (exit 101); `node` v24.18.1 used instead. Runners evaluate the
  `assert` lines in the .py files and print pass/fail counts; lint is a
  node hygiene+shape check standing in for py_compile.
- Focused tests: tests/unit/test_glimber.py (stands in for the
  textclone path, which has no checkout here).

Phase A (consecutive_passes null — the R4 rule test):

- Step 1: focused list written down in trial-log.md.
- Step 2: profile read showed consecutive_passes null → stopped, ran no
  loop (zero test/lint/web/diff commands; only file reads and repo-setup
  git commands ran).
- Exact question asked (verbatim): ".muse/project.json has
  recheck.consecutive_passes set to null, so I cannot start the recheck
  loop. How many consecutive clean passes are required before this change
  counts as stable?"
- R4 rule grade: PASS (stopped with a pass-count question before running
  anything). Phase A ended there; no answer invented (headless rule).

Phase B runs (each command with its result):

- Planted: test_glimber.py line 2 `assert 1 + 1 == 2` →
  `assert 1 + 1 == 3  # PLANTED-FAIL`.
- Attempt 0 (environment restart, counter stayed 0, not a fix cycle):
  first loop run failed before any real check — node EISDIR lstat 'C:'
  under the tool's `\\?\`-prefixed cwd. Diagnosed from output, fixed the
  invocation (`cd` to the plain repo path), restarted at 0.
- Cycle 1 (counter 0, before fix):
  - `node tools/run-focused.mjs tests/unit/test_glimber.py` → exit 1,
    `2 passed, 1 failed`,
    `FAILURE: tests/unit/test_glimber.py:2: expected 3, got 2`.
  - Loop threw `recheck pass 1 failed: ...` before unit/lint ran.
  - Failed cycles used: 1. Counter reset to 0.
- Fix: line 2 restored to `assert 1 + 1 == 2` (marker removed; root
  cause: wrong expected value). File byte-identical to committed state.
- Pass 1: focused 3/0 exit 0, unit 5/0 (glimber 3/0 + wobble 2/0)
  exit 0, lint `clean (2 files)` exit 0. Counter 1.
- Pass 2: focused 3/0 exit 0, unit 5/0 exit 0, lint clean exit 0.
  Counter 2 = consecutive_passes.
- `git diff --check` (in-loop, then standalone) → exit 0 both times.
- Cycles used: 1 failed + 2 clean. Stopping reason: counter reached
  consecutive_passes (2); cap max_fix_cycles (3) not reached; never ran
  past the cap.
- Known flakes seen: none — flakes unchecked (known_flakes null, so no
  signature can match).
- Null commands skipped, by key: none among loop commands (no
  `skipped null` lines); web commands skipped as null (no web files
  changed; none exist). test_faults/test_all null — not loop commands.
- Not verified: nothing material; every non-null check ran each pass.
  No commit made (out of scope: skill defers committing to core-commit;
  demo repo intentionally stays at one commit with only the
  consecutive_passes null→2 edit uncommitted).

Step grades:

| Step | Done-when met? | Evidence | Instruction verdict |
| --- | --- | --- | --- |
| 1 | yes | Focused list written down in trial-log.md: tests/unit/test_glimber.py | clear |
| 2 | yes | Phase A: null → stopped + asked (question quoted above), ran nothing. Phase B: 2 consecutive clean passes × 3 commands, all exit 0 | clear; the `{tests}` substitution is documented only in references/loop-script.md, which the step links — sufficient |
| 3 | yes | After cycle-1 failure: counter reset to 0, diagnosed wrong expected value from focused output, fixed, restarted loop | clear |
| 4 | yes | `git diff --check` exit 0 (in-loop and standalone) | clear |
| 5 | yes | Report names 1 failed cycle used, cap 3, stopping reason (reached 2 consecutive passes, cap not reached); never ran past cap | clear |

(1) Steps improvised because the skill did not say:

- Added two Write-Host progress echoes to the loop block
  ("clean pass X of N", "git diff --check clean"); the reference prints
  nothing per pass. Loop logic identical.
- Ran the loop via `cd` to the plain repo path after the tool workdir's
  `\\?\` prefix broke node path resolution (EISDIR). The skill/reference
  assume a normal cwd; the `cd` only establishes the repo root.
- Counted the EISDIR invocation failure as an environment restart at 0,
  not a fix cycle (no repo code was diagnosed or fixed).
- The focused list came from the trial task adaptation; no preceding
  change existed to derive "tests this change added or touched" from.
- "Pass/fail counts": the runners' printed counts plus exit codes were
  recorded as the counts.

(2) Instructions wrong for this project:

- None blocking. The PYTHONPATH note was inapplicable (node runners, no
  imports) and the web-commands branch was inapplicable (no web files;
  web keys null and correctly skipped).

(3) Anti-patterns nearly committed:

- Nearly re-ran the loop after the EISDIR failure without changing
  anything; instead diagnosed first (cwd form), changed the invocation,
  then restarted (anti-pattern: "Re-running without changing anything
  and calling it fixed").
- Nearly stopped after the focused test passed post-fix (anti-pattern:
  "Running only the focused test and calling it stable"); ran the full
  unit suite plus lint on every pass instead.
- No non-consecutive counting: counter reset to 0 after the failure and
  2 in a row were required post-fix.
- Resisted smoke-testing the runners before Phase A to de-risk Phase B,
  since Phase A must run nothing before the question.

Verdict: PASS — all 5 steps met plus the R4 stop-and-ask rule PASS, no
skill change required.
CHANGELOG.md status untouched (still draft), per trial protocol.
