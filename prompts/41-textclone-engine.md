# Prompts: 5.2 Textclone generation engine

Batch name: `textclone-engine`. Paste one block per message. Worktree, temporary data directory
and synthetic data only. Tests use `tests/fault_injection/mock_router.py` wherever a model would
otherwise be needed.

---

## `textclone-generation-loop` · P1

```text
Build the skill textclone-generation-loop. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when changing or explaining Textclone's checked generation loop: stages, targets, checks, best-so-far, budgets, cancellation, the report. Not for diagnosing a run that missed target (use `textclone-convergence-debug`).

Read first: textclone/generate/loop.py, planner.py, critic.py, repair.py, failsafe.py, report.py,
types.py, retrieval.py, checks/{base,content,style,fluency,ai}.py; textclone/metrics/composite.py;
plan.md §2 invariants 4 and 7; .env.example (TARGET_SCORE=85, MAX_ITERS=5, WALL_CLOCK_S=90);
tests/unit/test_generate_units.py, test_generation_stream.py, tests/fault_injection/test_loop_faults.py.

Steps:
1. references/loop-map.md: stages in order, what each reads/writes, which SSE event it emits,
   budgets checked where, cancellation points — every line with file:line.
2. For a change: name the invariant it touches (best-so-far, unverified ≠ passed, budgets).
3. Test first with the mock router (fault injection for failures).
4. Run focused + fault tests; the recheck loop.
Decision rules: never return worse than best-so-far; any unavailable hard check → status
unverified; cancellation leaves a clean terminal event.
Anti-patterns: bypassing checks for speed; changing scoring weights without the eval harness.
Evidence: the loop map, tests, invariants checked.

Evals:
T: "how does the rewrite loop decide to stop?" | "add a budget for fact-check calls" | "change how
best-so-far is kept" | "explain the stages of generation" | "make cancel stop faster in the loop"
N: "why did this run end at 82?" → textclone-convergence-debug | "repair broke a better check" →
textclone-critic-repair | "add email mode" → textclone-new-task-type

Trial: build the loop map from the code and answer, with file:line, where max_iters and the wall
clock are enforced.

Refine signals: loop changes that broke an invariant.
```

---

## `textclone-convergence-debug` · P1

```text
Build the skill textclone-convergence-debug. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring. Build after textclone-generation-loop.

Description (verbatim; change only if R2 fails):
Use when a Textclone generation stops short of target or reports misleadingly: inflated stage scores, fallbacks reported as passes, repairs on wrong sentences, length bands vs a terse voice. Not for general bugs (use `core-flow-bugfix`).

Purpose: the loop "never reaches target live" (roadmap problem 3); find out why per run.

Read first: docs/roadmap/05-generation-accuracy/PLAN.md steps 1–3, 7, 10 (Stage B convergence vs
inflated Stage A scores, honest fallbacks, targeted content surgery, soft length, identity
scoring), textclone/generate/loop.py, checks/content.py, repair.py, report.py.

Steps:
1. Get the run's report (scores per check per iteration, status, events) — numbers only.
2. Classify the shortfall with the decision table (references/shortfall-table.md): which check
   failed most; did scores plateau or oscillate; were fallbacks used; which sentences were
   repaired vs which caused the failure; did length dominate.
3. Reproduce with the mock router and a synthetic input shaped like the case.
4. Map to the roadmap 05 step that addresses it; fix through core-flow-bugfix or test through
   core-flow-experiment.
Decision rules: a fallback check reporting pass is a truthfulness bug first, a convergence bug
second; length misses inside a wider band are soft (05 step 7).
Anti-patterns: lowering the target to "fix" convergence; reading user text to debug.
Evidence: the per-iteration score table, the classification, the mapped step.

Evals:
T: "why do my rewrites always end around 82?" | "the loop never reaches 85" | "it says facts
passed but the planner fell back" | "repairs keep fixing the wrong sentence" | "length keeps
failing for my short style"
N: "explain the loop stages" → textclone-generation-loop | "repair order rules" →
textclone-critic-repair | "generic crash" → core-flow-bugfix

Trial: from a synthetic report (5 iterations, plateau at 82, length failing each time), classify
and map to 05 step 7.

Refine signals: classifications that turned out wrong after the fix.
```

---

## `textclone-critic-repair` · P2

```text
Build the skill textclone-critic-repair. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when changing Textclone's critic, revise or surgery repair: check priority order, which problems are sent to the model, and rolling back repairs that break a higher-priority check. Not for overall loop budgets (use `textclone-generation-loop`).

Read first: textclone/generate/critic.py, repair.py, orthography.py; textclone/llm/prompts.py
(REVISE, SURGERY — never edit in place); docs/roadmap/05-generation-accuracy/PLAN.md step 3 (targeted surgery mapping
facts to sentence indices); tests/unit/test_generate_units.py.

Steps:
1. Document the priority order of checks from code.
2. For a change: which repair path (revise vs surgery), which problems are listed, how sentences
   are chosen.
3. Rollback rule: a repair that breaks a higher-priority check is undone; test it.
4. New prompt needs → a new template (core-prompt-versioning).
Decision rules: facts outrank style; surgery edits only marked sentences; rollback is mandatory.
Anti-patterns: editing REVISE/SURGERY in place; repairs that rewrite the whole text.
Evidence: the priority table, rollback tests.

Evals:
T: "the repair step makes facts worse" | "surgery should only touch the broken sentences" | "what
order are problems fixed in?" | "roll back repairs that break meaning" | "improve the critic's
problem list"
N: "the run stops at 82" → textclone-convergence-debug | "change the revise prompt text" →
textclone-prompt-parity | "budget for calls" → textclone-generation-loop

Trial: write a mock-router test where a repair breaks the facts check and confirm rollback.

Refine signals: repairs that degraded outputs.
```

---

## `textclone-new-task-type` · P2

```text
Build the skill textclone-new-task-type. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when adding a new Textclone task (variants, continue writing, edit in place, email, summarise): reuse the checked loop; new template, API, CLI, Studio option, tests. Not for formats or audiences (use `textclone-compose-registry`).

Read first: docs/roadmap/09-new-capabilities/PLAN.md ("Pattern for every new task", steps 1–11),
textclone/generate/types.py (GenerationRequest.task Literal), loop.py, llm/prompts.py,
api/routes/generate.py, cli/gen_cmds.py, web/app/studio.

Steps (the roadmap's 5-step pattern, expanded):
1. Add the task to GenerationRequest.task with validation.
2. Add a new prompt template (never edit existing ones).
3. Decide content checks, length and fact rules for the task.
4. Expose in API body, CLI flag, Studio option (UI through the UI track rules if active).
5. Unit test, fault-injection case, benchmark item.
Decision rules: no parallel pipeline; tasks needing different checks configure the loop.
Anti-patterns: copying loop.py; skipping the fault case.
Evidence: the 5 steps with files and tests.

Evals:
T: "add continue-writing" | "implement email mode as a task" | "add a summarise in my voice
option" | "support tweet threads" | "add edit-in-place for a selected span"
N: "add an audience preset" → textclone-compose-registry | "design the feature" →
core-product-brief | "the loop stops early" → textclone-convergence-debug

Trial: plan (no code) the "continue writing" task through the 5 steps with exact files.

Refine signals: new tasks that broke existing ones.
```

---

## `textclone-latency` · P2

```text
Build the skill textclone-latency. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring. Build after core-latency-budget and core-perf-profiling.

Description (verbatim; change only if R2 fails):
Use when Textclone generation, profile builds or analysis are too slow: per-stage timing, warm models, batching, call counts, VRAM swaps. Not for generic profiling method (use `core-perf-profiling`).

Read first: docs/roadmap/05-generation-accuracy/PLAN.md step 11 (19–128 s rewrites; keep metric models warm; batch),
docs/roadmap/README.md (first-event latency 35.7 s → 0.2 s fix), textclone/resources/vram.py,
textclone/llm/router.py, .env.example (MAX_LOADED_MODELS=1).

Steps:
1. Stage timings from SSE events or logs over 5 runs (mock router for pipeline overhead; live
   only with approval).
2. Split time: LLM calls (count × time), metric models (load vs compute), DB, retrieval.
3. Check model swaps (one loaded model at a time) and cold metric loads.
4. Change one thing (warmth, batching, fewer calls) through core-flow-experiment; quality must not
   drop (eval harness).
Decision rules: never trade away a hard check for speed; measure warm and cold.
Anti-patterns: optimising without the stage table.
Evidence: stage table before/after, quality check.

Evals:
T: "rewrites take two minutes" | "why is the first rewrite after startup so slow?" | "reduce LLM
calls per run" | "metric models reload every time" | "speed up analyze"
N: "set budgets" → core-latency-budget | "generic python profiling" → core-perf-profiling | "model
OOM" → core-ollama-models

Trial: build the stage table from a mock-router run in a worktree.

Refine signals: latency regressions.
```

---

## `textclone-prompt-parity` · P1

```text
Build the skill textclone-prompt-parity. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring. Build after core-prompt-versioning.

Description (verbatim; change only if R2 fails):
Use when touching Textclone prompt templates or the fine-tune dataset: training and serving must render identical prompts; existing templates are never edited in place. Not for generic prompt versioning (use `core-prompt-versioning`).

Read first: textclone/llm/prompts.py (templates and _T registry), textclone/finetune/dataset.py,
plan.md §2 invariant 5, tasks.md G7 (stop condition), tests/unit/test_finetune_dataset.py.

Steps:
1. Before any prompt change, check consumers: render("<name>") call sites and the dataset.
2. If the template is consumed by training → stop condition; add a new template.
3. Parity test: render the same inputs via the serving path and the dataset path; assert identical.
4. Record the template inventory in references/templates.md (name, consumers, frozen yes/no).
Decision rules: whitespace and Jinja changes count; a parity test failure blocks merge.
Anti-patterns: "harmless" typo fixes to frozen templates.
Evidence: consumers list, parity test result.

Evals:
T: "fix a typo in the rewrite template" | "does the fine-tune data use the same prompts as
serving?" | "add facts to the brief prompt" | "list which templates are frozen" | "write a parity
test"
N: "version a prompt in general" → core-prompt-versioning | "fine-tune gate" →
textclone-finetune-safety | "change revise logic" → textclone-critic-repair

Trial: write the template inventory with consumers from the code.

Refine signals: any parity break.
```

---

## `textclone-llm-router` · P2

```text
Build the skill textclone-llm-router. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when changing Textclone's model routing: model order, fallbacks, circuit breaker, smaller-context retry, timeouts, JSON repair and their error codes. Not for choosing models for the GPU (use `core-ollama-models`).

Read first: textclone/llm/router.py (num_ctx 4096 retry), ollama.py, breaker.py, json_repair.py,
base.py; textclone/api/router_status.py; textclone/errors.py (LLM_* codes); docs/roadmap/08-learning-finetune/PLAN.md
step 1 (breaker probe leak, fixed); tests/unit/test_errors_and_llm_utils.py, tests/fault_injection/.

Steps:
1. Map the routing decision tree with file:line.
2. For a change: which errors trigger fallback, retry, or open the breaker; what the user sees.
3. Fault-injection tests for each path.
Decision rules: every failure ends in a structured LLM error with a hint; fallbacks are visible
in the report (route/fallback events).
Anti-patterns: infinite retries; swallowing timeouts.
Evidence: the decision tree, tests.

Evals:
T: "fall back to mistral when qwen times out" | "the breaker never closes" | "what happens when
ollama is down?" | "retry with a smaller context" | "router status is wrong in the UI"
N: "which quantisation fits" → core-ollama-models | "broken JSON from the model" →
core-structured-output | "loop budget" → textclone-generation-loop

Trial: map the decision tree from router.py and breaker.py.

Refine signals: routing incidents.
```

---

## `textclone-compose-registry` · P2

```text
Build the skill textclone-compose-registry. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when working on Textclone compose: formats, audiences, modifiers, regenerate modes (quick, balanced, thorough, different) and the registry endpoint. Not for new task types (use `textclone-new-task-type`).

Read first: textclone/compose/ (audiences.py, formats.py, models.py, modifiers.py, runtime.py),
textclone/api/routes/compose.py (GET /api/compose/registry), docs/roadmap/06-compose-longform/PLAN.md
(3 open Codex P2 findings), tests/unit/test_api_compose.py, test_compose_modifiers.py,
docs/ui-redesign (presets use the registry).

Steps:
1. Inventory registry entries and how each modifies bands or prompts (FORMAT_BLOCK).
2. For a change: registry shape stays compatible (the UI reads it).
3. Tests for each modifier's effect on targets.
4. Check the open findings in 06 before touching related code.
Decision rules: presets are never applied by default (UI parity rule); new formats add, never
rename, keys.
Anti-patterns: duplicating registry data in the UI.
Evidence: inventory, tests, findings checked.

Evals:
T: "add a 'formal email' format" | "what do the regen modes actually change?" | "the registry
endpoint shape" | "add an audience for my manager" | "fix the compose findings from codex"
N: "add a continue-writing task" → textclone-new-task-type | "UI presets drawer" →
textclone-ui-guardrails | "loop budgets" → textclone-generation-loop

Trial: inventory the registry from code with each modifier's effect.

Refine signals: compose regressions.
```

---

## `textclone-multi-profile` · P3

```text
Build the skill textclone-multi-profile. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when Textclone needs more than one voice profile ("me at work", or another consenting author): separate corpus scope, profile switching, privacy boundaries. Not for registers within one profile (use `textclone-registers`).

Read first: docs/roadmap/09-new-capabilities/PLAN.md step 10 (personas; schema already has profile_id),
textclone/db/schema/v001.sql (profile_id uses), textclone/db/repo_corpus.py, profile/builder.py.

Steps:
1. Map every query that should be scoped by profile_id; find unscoped ones.
2. Consent: other authors' text only with consent recorded; separate scope; deletable.
3. UI: profile switcher; every result shows which profile.
4. Tests: no cross-profile leakage in retrieval, exemplars, calibration.
Decision rules: unscoped query = leak = blocker.
Anti-patterns: mixing corpora "for more data".
Evidence: the query scope table, leakage tests.

Evals:
T: "I want a separate profile for work writing" | "add my co-author's voice" | "switch profiles in
studio" | "make sure profiles don't mix" | "delete the second profile completely"
N: "work vs casual registers" → textclone-registers | "privacy before commit" →
core-privacy-guard | "grow the corpus" → textclone-corpus-growth

Trial: build the query scope table from repo_corpus.py and list unscoped queries.

Refine signals: leakage.
```
