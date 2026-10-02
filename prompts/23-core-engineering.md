# Prompts: 3.4 Engineering quality

Batch name: `core-eng`. Paste one block per message.

Facts this group relies on (checked 2026-10-02 in textclone's `pyproject.toml` and `web/package.json`):
- Python dev tools: pytest, pytest-asyncio and ruff. There is no hypothesis, mypy, pyright,
  pytest-cov or mutmut.
- Ruff config: line length 110; rules E, F, I, UP, B.
- Web: there is no `test` script and no Playwright dependency. The layout audit drives Chromium over
  CDP with Node's built-in WebSocket.

Any skill that needs a tool that isn't installed must say so and route the decision to
`core-dependency-audit` and the user. It must never install the tool silently.

---

## `core-test-first` · P1

```text
Build the skill core-test-first. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when fixing a bug or adding behaviour: write the regression or acceptance test first, watch it fail for the stated reason, then change code. Not for proving stability after (use `core-recheck-loop`). Runs only when invoked by name. Writes .agents/runs/core-test-first/.

Purpose: every behaviour change is pinned by a test that was seen failing.

Read first: textclone tasks.md §G3 items 2 and 4 (test first, record the failing line; no weakened
checks), docs/AI_WORKFLOW.md "Diagnose and fix" step 5, tests/conftest.py (data isolation guard),
tests/fault_injection/mock_router.py.

Steps:
1. Pick the test location next to the existing tests for that module (AI_WORKFLOW source map).
2. Write the test from the acceptance criterion or the bug's reproduction; synthetic data only.
3. Run it; it must fail, and for the stated reason. Record the one-line failure.
4. If it passes before the fix: the gap is not reproduced → stop and report.
5. Change the code minimally; run the test until it passes.
6. Hand over to core-recheck-loop.
Decision rules: test the failure path and the recovery, not only the happy path; never assert on
implementation details that will change; models/GPU/network needed → use the mock router or mark
the test manual (tasks.md G7).
Anti-patterns: writing the test after the fix; tests that open the real database; loosening an
existing assertion.
Evidence: the test id, the failing line before, passing after.

Evals:
T: "fix the timezone crash in ingest, test first" | "add a regression test for this bug" | "before
changing the loop, write a test that shows the problem" | "TDD this feature" | "prove the bug
exists with a failing test"
N: "run the tests three times" → core-recheck-loop | "is this test flaky?" → core-flake-triage |
"write browser tests" → core-web-test

Trial: in a textclone worktree, write a failing unit test for a synthetic bug you introduce in a
trial copy of a helper, then fix it; never commit.

Refine signals: tests that passed before the fix (gap not reproduced) but the task went ahead.
```

---

## `core-debug-method` · P1

```text
Build the skill core-debug-method. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when something fails and the cause is unknown: reproduce, shrink to the smallest failing case, log hypotheses, test one variable at a time, find the first wrong state. Not for finding the breaking commit (use `core-git-bisect`). Runs only when invoked by name. Writes .agents/runs/core-debug-method/.

Purpose: replace guess-and-patch with a method that converges.

Read first: textclone docs/AI_WORKFLOW.md "Diagnose and fix" (all 6 steps), textclone/errors.py
(codes and request ids), textclone/log.py.

Steps:
1. Write expected vs actual, with the error code and request id if any.
2. Reproduce with the smallest command or test; synthetic input.
3. Shrink: remove inputs and steps until the failure would disappear.
4. Hypothesis log (references/hypothesis-log.md): hypothesis | test | result | conclusion.
   One variable per test.
5. Trace where the first wrong state appears (API shape → route → service → storage).
6. Separate environment causes (missing model, interpreter, sandbox) from logic defects.
7. Fix the cause (core-test-first), not the symptom.
Decision rules: three failed hypotheses → widen the search (logs, git history, bisect); never
change two things at once; broad catches that exist at boundaries are deliberate — don't remove
them to "see the error", log instead.
Anti-patterns: patching where the error surfaced instead of where it started; "works on my
machine"; deleting the evidence (logs) while debugging.
Evidence: the reproduction, the hypothesis log, the cause with file:line.

Evals:
T: "the generation stream hangs and I don't know why" | "this crash makes no sense, figure it
out" | "debug why jobs never finish" | "the error only happens sometimes with long inputs" |
"find the root cause of the 500 on upload"
N: "which commit broke this?" → core-git-bisect | "is this test just flaky?" → core-flake-triage
| "fix it with a test first" → core-test-first

Trial: give the skill a synthetic bug in a trial script (an off-by-one in a chunker) with a
misleading error; grade whether the hypothesis log converges.

Refine signals: debug sessions that ended in a symptom patch later reopened.
```

---

## `core-git-bisect` · P2

```text
Build the skill core-git-bisect. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when something used to work and now doesn't: find the first bad commit with a scripted git bisect in a worktree. Not for unknown failures with no known-good point (use `core-debug-method`). Runs only when invoked by name. Writes .agents/runs/core-git-bisect/.

Purpose: find the breaking change in log2(n) steps.

Read first: git bisect documentation (git help bisect); core-worktree.

Steps:
1. Find a good commit and a bad commit; confirm both by running the check.
2. Write a check script that exits 0 good, 1 bad, 125 skip (for unbuildable commits).
3. Run git bisect in a worktree (never the main checkout): start, bad, good, run.
4. Record the first bad commit; git bisect reset.
5. Read the commit; hand over to core-debug-method with the narrowed diff.
Decision rules: shallow clones need more history (fetch with a depth bound); flaky checks → run
each step 3 times; never bisect in someone else's worktree.
Anti-patterns: bisecting in the main checkout; manual good/bad marking by eye.
Evidence: the script, the bisect log, the first bad commit.

Evals:
T: "this worked last week, find what broke it" | "bisect the regression in the profile builder" |
"which commit introduced the slowdown?" | "find the first bad commit for this test" | "it passed on
the old tag, track down the change"
N: "debug the hang" → core-debug-method | "revert the last commit" → none | "check flakiness" →
core-flake-triage

Trial: in a trial repo of 16 commits where commit 11 breaks a test, bisect and find 11.

Refine signals: bisects derailed by flaky checks.
```

---

## `core-diff-self-review` · P1

```text
Build the skill core-diff-self-review. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use before any commit, handoff or review request: re-read your own diff as a hostile reviewer — edge cases, error paths, scope creep, leftover debug code, broken contracts. Not for reviewing someone else's PR (use `core-codex-handoff`). Runs only when invoked by name. Writes .agents/runs/core-diff-self-review/.

Purpose: catch your own mistakes before anyone else has to.

Read first: textclone AGENTS.md (review expectations), docs/AI_WORKFLOW.md "Review and handoff
format" (severity, trigger, impact, evidence), tasks.md §G3 (no placeholders, no weakened checks).

Checklist (references/checklist.md): scope (only the task's files); placeholders (TODO, pass,
NotImplementedError, commented-out code); error paths (structured errors with hints, no blanket
catch); edge cases (empty, huge, unicode, cancel); contracts (API shapes, SSE events, error
codes unchanged unless intended); tests (failure path covered); privacy; debug leftovers (print,
console.log); formatting churn.

Steps:
1. git diff (and --cached); read every hunk.
2. Go through the checklist; write a finding per issue with file:line.
3. Fix findings; re-run the affected checks.
4. State what you could not verify.
Decision rules: if the diff exceeds the task's scope → split or ask; any finding of a contract
change → confirm it was intended.
Anti-patterns: skimming; reviewing the description instead of the diff.
Evidence: the findings list and fixes.

Evals:
T: "check your changes before committing" | "review your own diff hard" | "anything you missed in
this patch?" | "self-review before handing to Codex" | "look for leftovers in what you changed"
N: "ask Codex to review" → core-codex-handoff | "security review" → core-security-review | "run
the tests" → core-recheck-loop

Trial: review a synthetic diff with 5 planted problems (a TODO, a console.log, a swallowed
exception, an unrelated reformat, a changed error code); score how many are found.

Refine signals: issues Codex finds that the self-review should have caught.
```

---

## `core-refactor-safely` · P2

```text
Build the skill core-refactor-safely. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when restructuring code without changing behaviour: pin current behaviour with tests first, change in small steps, prove nothing changed. Not for fixing bugs (use `core-flow-bugfix`). Runs only when invoked by name. Writes .agents/runs/core-refactor-safely/.

Purpose: cleaner code, same behaviour, proven.

Read first: textclone tasks.md §G3 (scope, style, no drive-by reformatting); plan.md §2 invariants
(fine-tune parity: never edit prompt templates in place).

Steps:
1. State what behaviour must not change.
2. Write characterisation tests that capture current outputs (including odd ones).
3. Refactor in steps that keep tests green after each step; commit per step.
4. Compare outputs before/after on a fixed synthetic input set.
5. Remove dead code only when grep finds no caller and the tests still pass without it.
Decision rules: behaviour change discovered → stop and split it into a separate task; protected
files (prompts, schema) are never "refactored".
Anti-patterns: big-bang rewrites; refactor plus feature in one commit.
Evidence: the characterisation tests, step commits, output comparison.

Evals:
T: "clean up loop.py without changing what it does" | "split this huge function safely" |
"restructure the ingest pipeline" | "make this module readable, same behaviour" | "extract the
retry logic into a helper"
N: "fix the convergence bug" → core-flow-bugfix | "add type hints" → core-type-hardening |
"speed this up" → core-perf-profiling

Trial: refactor a synthetic 80-line function in a trial folder with characterisation tests first.

Refine signals: refactors that changed behaviour.
```

---

## `core-api-design` · P2

```text
Build the skill core-api-design. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when adding or changing an API endpoint, CLI command or public function: naming, request/response shapes, errors, versioning, backward compatibility. Not for Textclone's existing error rules (use `textclone-error-contract`). Runs only when invoked by name. Writes .agents/runs/core-api-design/.

Purpose: interfaces that are consistent and don't break callers.

Read first: textclone textclone/api/routes/*.py (house style), textclone/api/middleware.py (RFC
7807 problems), textclone/cli/main.py (exit codes 0–6 in README), web/lib/api.ts.

Steps:
1. Find the closest existing endpoint/command; copy its conventions.
2. Write the contract: path/command, inputs with validation, outputs, errors (codes), exit codes.
3. Check compatibility: existing callers (UI, CLI, tests) still work; additive changes only, or
   a version.
4. Add contract tests.
Decision rules: never rename or remove a field callers use; new optional fields only; errors are
structured, never bare strings.
Anti-patterns: one-off naming; returning 200 with an error body; breaking the UI's parity.
Evidence: the contract, the callers checked, the tests.

Evals:
T: "add an endpoint for exporting results" | "design the API for batch jobs" | "add a CLI command
for evaluation" | "change the response of the profile route" | "what should this function's
signature be?"
N: "the error code is wrong" → textclone-error-contract | "SSE events order" →
textclone-sse-contract | "write the API tests" → textclone-api-contract

Trial: design (no code) the API and CLI for textclone roadmap 02 step 2 ("textclone eval run")
following existing conventions; cite the files copied from.

Refine signals: contract changes that broke callers.
```

---

## `core-state-machines` · P2

```text
Build the skill core-state-machines. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when something has a lifecycle (jobs, runs, uploads, UI modes): model states and transitions explicitly so none are impossible, stuck or unreachable. Not for UI visual states only (use `core-states-design`). Runs only when invoked by name. Writes .agents/runs/core-state-machines/.

Purpose: no stuck jobs, no impossible states.

Read first: textclone textclone/resources/jobs.py, textclone/api/routes/jobs.py, textclone/cli
jobs commands (README), web/components/JobProgress.tsx.

Steps:
1. List states and events from the code (not from memory).
2. Draw the transition table: state × event → next state (or "invalid").
3. Find: states with no exit (stuck), unreachable states, events with no handler, terminal states
   that can be left.
4. Add guards and tests per transition, especially cancel and crash.
5. Check the UI mirrors the same states.
Decision rules: cancel and failure are reachable from every non-terminal state; terminal states
are final; resume paths are explicit.
Anti-patterns: boolean flags combining into states; status strings duplicated across layers.
Evidence: the transition table (references/table-template.md), findings, tests.

Evals:
T: "jobs sometimes get stuck in running" | "model the lifecycle of a generation" | "what states can
an upload be in?" | "can a cancelled job be resumed?" | "design the states for batch mode"
N: "design the loading screen" → core-states-design | "race condition in the db" →
core-concurrency-review | "resume a job" → textclone-jobs-recovery

Trial: build textclone's job transition table from resources/jobs.py; list any gaps.

Refine signals: stuck states found in use.
```

---

## `core-concurrency-review` · P2

```text
Build the skill core-concurrency-review. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when code uses threads, async tasks, background workers or shared connections: review for races, shared state, cancellation and cleanup. Not for lifecycle modelling (use `core-state-machines`). Runs only when invoked by name. Writes .agents/runs/core-concurrency-review/.

Purpose: concurrency bugs found by review, not by users.

Read first: textclone plan.md B-3 (migration first-connect race) and the roadmap "connection
shared across threads" item (docs/roadmap/01-data-integrity/PLAN.md); textclone/db/connection.py;
textclone/api/sse.py (worker thread with heartbeats); textclone/resources/watchdog.py.

Steps:
1. Map concurrency: threads, async tasks, processes, and what each touches.
2. For each shared resource: who reads/writes, what protects it.
3. Check: connections per thread (SQLite), first-run initialisation races, cancellation reaching
   every worker, cleanup on error, heartbeats/timeouts.
4. Write a test that forces the interleaving (barriers, many iterations) where practical.
Decision rules: an unprotected shared write is a finding even if no failure has been seen; SQLite
connections are never shared across threads unless the code proves it safe.
Anti-patterns: sleep-based fixes; catching and ignoring cancellation.
Evidence: the concurrency map, findings with file:line, tests.

Evals:
T: "the migration race — review the connection code" | "is this worker thread safe?" | "database is
locked errors sometimes" | "review the SSE worker for races" | "does cancel reach every thread?"
N: "jobs stuck in a state" → core-state-machines | "it's slow" → core-perf-profiling | "flaky
test" → core-flake-triage

Trial: map concurrency in textclone/api/sse.py and textclone/db/connection.py and list findings
(review only).

Refine signals: concurrency bugs found later.
```

---

## `core-property-tests` · P3

```text
Build the skill core-property-tests. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when a function has rules that hold for all inputs (parsers, chunkers, dedup, scoring): write property-based tests with generated inputs. Not for single regression cases (use `core-test-first`). Runs only when invoked by name. Writes .agents/runs/core-property-tests/.

Purpose: find edge cases nobody writes by hand.

Read first: textclone pyproject.toml (hypothesis is NOT installed); textclone/ingest/segment.py,
dedup.py, textclone/generate/orthography.py as candidates.

Steps:
1. Check whether a property-testing library is installed; if not, stop: propose it via
   core-dependency-audit and ask the user. Offer a stdlib fallback (random inputs with a fixed
   seed, many iterations).
2. Write properties: round-trips, invariants (length, order, no loss), idempotence.
3. Run; shrink failures to minimal examples; add them as regression tests.
Decision rules: fixed seeds in CI; properties must be true by spec, not by current behaviour.
Anti-patterns: properties that restate the implementation.
Evidence: properties, failures found, regression tests added.

Evals:
T: "fuzz the segmenter" | "test the dedup with random inputs" | "property test the chunker" |
"find edge cases in the parser automatically" | "does this hold for every input?"
N: "write a regression test" → core-test-first | "do the tests catch bugs?" →
core-mutation-check | "fix the parser crash" → core-flow-bugfix

Trial: stdlib-fallback property tests for a trial copy of a sentence splitter (synthetic).

Refine signals: bugs a property would have caught.
```

---

## `core-mutation-check` · P3

```text
Build the skill core-mutation-check. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when asking whether tests would actually catch bugs in critical code: make small deliberate code mutations and check that tests fail. Not for coverage numbers alone or writing new tests from criteria (use `core-test-first`). Runs only when invoked by name. Writes .agents/runs/core-mutation-check/.

Purpose: measure test strength where it matters.

Read first: textclone pyproject.toml (mutmut is NOT installed); critical modules:
textclone/generate/loop.py, textclone/metrics/composite.py, textclone/db/backup.py.

Steps:
1. Without a tool: hand-mutate in a worktree (flip a comparison, drop a line, change a constant),
   10–20 mutations per module, run the module's tests each time; revert each.
2. With a tool: only after the user approves it (core-dependency-audit).
3. Record survivors (mutations no test caught); write tests for the important ones.
Decision rules: worktree only; every mutation reverted (git diff empty at the end).
Anti-patterns: mutating the main checkout; chasing 100%.
Evidence: the mutation table with caught/survived, tests added.

Evals:
T: "are our loop tests actually any good?" | "check if the tests would catch a bug in backup" |
"run a mutation check on composite scoring" | "how strong is the test suite here?" | "would the
tests notice if I broke this?"
N: "write tests for this feature" → core-test-first | "fuzz the parser" → core-property-tests |
"tests are flaky" → core-flake-triage

Trial: 10 hand mutations on a trial copy of a small module; report survivors.

Refine signals: bugs slipping past tests in modules marked strong.
```

---

## `core-type-hardening` · P3

```text
Build the skill core-type-hardening. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when raising type safety one module at a time: add or tighten type hints and checks without behaviour change. Not for general refactors (use `core-refactor-safely`). Runs only when invoked by name. Writes .agents/runs/core-type-hardening/.

Purpose: fewer runtime type bugs, gradually.

Read first: textclone pyproject.toml (no mypy/pyright installed; ruff UP rules on); web
tsconfig.json (TypeScript strictness); textclone/generate/types.py.

Steps:
1. Pick one module; list untyped or Any-typed public functions.
2. Add precise hints; prefer existing types (pydantic models, TypedDicts).
3. Python: if no checker is installed, propose one via core-dependency-audit; meanwhile rely on
   tests and ruff. TypeScript: run tsc --noEmit (commands.typecheck_web).
4. Fix real issues found; never cast to silence an error without a comment why.
Decision rules: one module per commit; no behaviour change.
Anti-patterns: Any everywhere; ts-ignore.
Evidence: before/after counts of untyped functions; checker output.

Evals:
T: "add proper types to the router module" | "tighten typescript in lib/api.ts" | "too many Any
types, fix one module" | "make the types strict here" | "type the generation results"
N: "restructure this module" → core-refactor-safely | "add a linter" → core-dependency-audit |
"fix the build error" → core-nextjs16

Trial: list untyped public functions in a trial copy of textclone/llm/router.py and type them.

Refine signals: runtime type errors in hardened modules.
```

---

## `core-perf-profiling` · P2

```text
Build the skill core-perf-profiling. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when something is slow: measure before optimising — profile, find the hot spots, change one thing, measure again with a before/after table. Not for setting time budgets (use `core-latency-budget`). Runs only when invoked by name. Writes .agents/runs/core-perf-profiling/.

Purpose: speed work driven by measurements.

Read first: textclone docs/roadmap/05-generation-accuracy/PLAN.md step 11 (latency: 19–128 s,
keep metric models warm, batch); Python cProfile docs (stdlib); React Profiler docs.

Steps:
1. Define the scenario and the metric (wall time, first event, memory) with synthetic input.
2. Baseline: run 5 times; record median and spread.
3. Profile (cProfile + pstats for Python; Chrome performance panel or React Profiler for UI).
4. Pick the top hot spot; form a hypothesis; change one thing.
5. Re-measure 5 times; keep only if the median improves beyond the spread.
Decision rules: never optimise without a baseline; GPU/model timings need the same warm state for
before and after; no new dependencies for profiling (stdlib first).
Anti-patterns: single-run comparisons; optimising cold paths.
Evidence: the before/after table with medians and spreads, the profile excerpt.

Evals:
T: "rewrites take two minutes, why?" | "profile the profile builder" | "the analyze page is
sluggish" | "find what's slow in ingest" | "speed up startup"
N: "set a latency budget per stage" → core-latency-budget | "textclone generation latency" →
textclone-latency | "memory leak in the worker" → core-debug-method

Trial: profile a synthetic CPU-bound script in a trial folder, fix the hot spot, show the table.

Refine signals: optimisations that didn't hold up in real use.
```

---

## `core-dependency-audit` · P2

```text
Build the skill core-dependency-audit. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when a new package or upgrade is proposed: check need, licence, size, maintenance, lockfile diff and whether something installed already does it. Not for security reviews of our code (use `core-security-review`). Runs only when invoked by name. Writes .agents/runs/core-dependency-audit/.

Purpose: few, deliberate dependencies.

Read first: textclone pyproject.toml, requirements*.txt, web/package.json and package-lock.json;
docs/ui-redesign/GUARDRAILS.md G4 (only one allowed new dependency in the UI track); tasks.md G3
item 5 (zero new dependencies in audit tasks).

Steps:
1. State the need; search for an installed package or stdlib that covers it.
2. For the candidate: licence, last release, maintainers, size, transitive deps, Windows/CUDA
   compatibility.
3. Show the lockfile diff in a worktree (never install into the shared venv from a worktree).
4. Recommend: add / don't add / alternative; the user decides.
Decision rules: project rules that forbid new deps win; GPL in an MIT project → flag; models
downloads are separate decisions.
Anti-patterns: installing to "try it"; upgrading majors casually.
Evidence: the comparison table and the lockfile diff.

Evals:
T: "should we add hypothesis?" | "can I install playwright for tests?" | "upgrade next to the
newest version" | "is this npm package safe to add?" | "we need a library for fuzzy matching"
N: "security review of the upload route" → core-security-review | "add a feature" →
core-flow-feature | "check licences of our own code" → none

Trial: audit adding hypothesis to textclone (no install); produce the table.

Refine signals: dependencies added later regretted.
```

---

## `core-flake-triage` · P1

```text
Build the skill core-flake-triage. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when a test fails intermittently or in code you didn't touch: decide with evidence whether it's a known flake, an environment problem, or a real bug. Not for debugging a known real bug (use `core-debug-method`). Runs only when invoked by name. Writes .agents/runs/core-flake-triage/.

Purpose: "flake" is never a root cause; every intermittent failure gets classified with evidence.

Read first: textclone tasks.md §G4 (the known flake B-3 signature), plan.md §3 B-3, .muse/project.json
known_flakes.

Steps:
1. Capture the exact failure text and test id.
2. Match against known_flakes signatures; a match → record it and continue the task.
3. No match: re-run that test alone 10 times; then with the suite 3 times. Record the counts.
4. Check environment: ports busy, models missing, file locks, leftover processes.
5. Classify: known flake / environment / real bug (→ core-debug-method) / new flake (add to
   known_flakes through core-project-profile with a signature and owner).
Decision rules: never skip, xfail or retry-decorate a test to get green; a new flake is recorded
with evidence, not assumed.
Anti-patterns: re-running until green; ignoring failures outside your change.
Evidence: the failure text, run counts, classification.

Evals:
T: "test_jobs_and_settings_endpoints failed again" | "a test I didn't touch is failing" | "is this
just flaky?" | "the suite fails every few runs" | "database is locked in one test"
N: "debug this crash" → core-debug-method | "run the loop" → core-recheck-loop | "find the commit
that broke it" → core-git-bisect

Trial: triage a synthetic test that fails 30% of the time due to a random seed; classify it.

Refine signals: "flakes" later found to be real bugs.
```

---

## `core-web-test` · P1

```text
Build the skill core-web-test. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when a UI behaviour needs an automated browser check: drive a production build against a mock API on owned ports and assert the interaction. Not for layout geometry (use `core-layout-audit`). Runs only when invoked by name. Writes .agents/runs/core-web-test/.

Purpose: real interactions tested without the live backend.

Read first: textclone docs/ui-redesign/guardrails/layout/run-audit.mjs and mock-api.mjs (CDP via
Node's WebSocket, production build, hydration wait, Input.insertText for typing);
web/lib/sse.test.mjs (node --test style); web/package.json (no test script, no Playwright).

Steps:
1. Build production (commands.build_web) and serve on an owned port with the mock API.
2. Use what is installed: the CDP approach from the audit runner, or node --test for lib/.
   Playwright only after core-dependency-audit and user approval.
3. Wait for hydration before interacting.
4. Assert visible results and network requests (for parity: same requests as before).
5. Kill the whole browser process tree after the run.
Decision rules: never against next dev; never the user's ports; one behaviour per test.
Anti-patterns: fixed sleeps; asserting CSS details (that's the audit); leaving browsers running.
Evidence: the test command, pass/fail, network log excerpt.

Evals:
T: "test that cancel stops the run in the browser" | "automate the copy button check" | "write a
browser test for the drawer" | "check the rewrite flow end to end automatically" | "make sure the
upload still posts the same request"
N: "boxes overflow on phone" → core-layout-audit | "walk it as a user" → core-user-journey-walk |
"unit test lib/sse.ts" → core-test-first

Trial: write one CDP-driven check against textclone's mock API that opens Studio and asserts the
Run button exists; run on owned ports.

Refine signals: browser tests that flake; UI regressions missed.
```

---

## `core-security-review` · P2

```text
Build the skill core-security-review. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when reviewing code for security: input handling, file paths, uploads, local server exposure, host/CSRF guards, secrets, and data leaks. Not for evaluating a new package (use `core-dependency-audit`). Runs only when invoked by name. Writes .agents/runs/core-security-review/.

Purpose: a local app that is still safe against malicious files, pages and inputs.

Read first: textclone docs/roadmap/11-security-hardening/PLAN.md; tasks.md Phase 3 (host/header
guard, UI-CP3); textclone/api/middleware.py; textclone/ingest/ (file parsing); orion README (path
jail, approvals, schema pins) as a contrasting model.

Steps:
1. Map entry points: HTTP routes, uploads, CLI args, files read, URLs fetched.
2. For each: validation, size limits, path traversal, injection (SQL, prompt, shell), DoS (huge
   inputs).
3. Local exposure: bind address, host header checks, CSRF from browser pages, CORS.
4. Secrets and data: .env handling, logs leaking text, error messages leaking paths.
5. Write findings with severity, trigger, impact, evidence, fix.
Decision rules: a local-only app is still reachable from any web page the user visits → treat
browser-origin requests as hostile; findings are reported, fixes go through core-flow-bugfix.
Anti-patterns: "it's local so it's fine"; generic OWASP lists without file:line.
Evidence: the entry-point map and findings.

Evals:
T: "is the upload route safe?" | "could a website talk to my local textclone?" | "security review
of the API" | "check for path traversal in ingest" | "do logs leak my writing?"
N: "should we add this package?" → core-dependency-audit | "privacy check before commit" →
core-privacy-guard | "harden the orion tools" → none

Trial: map entry points of textclone/api/routes/samples.py and review uploads (review only).

Refine signals: security issues found later.
```
