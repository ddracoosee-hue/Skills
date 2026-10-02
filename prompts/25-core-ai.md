# Prompts: 3.6 AI and LLM products

Batch name: `core-ai`. Paste one block per message.

Facts this group relies on: textclone `.env.example` sets the Ollama host to `127.0.0.1:11434`.
The generator models are `qwen3:14b`, `mistral-nemo:latest` and `deepseek-r1:8b-0528-qwen3-q8_0`.
The Ollama settings are:
- `OLLAMA_FLASH_ATTENTION=1`
- `OLLAMA_KV_CACHE_TYPE=q8_0`
- `OLLAMA_MAX_LOADED_MODELS=1`
- `OLLAMA_NUM_PARALLEL=1`

The router drops `num_ctx` to 4096 on retry (`textclone/llm/router.py`). The GPU is an RTX 4070 Ti
SUPER with 16 GB (README).

---

## `core-ollama-models` · P1

```text
Build the skill core-ollama-models. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when choosing, loading or troubleshooting local Ollama models: VRAM budget, quantisation, context length, keep_alive, one-model-at-a-time limits, timeouts. Not for prompt wording (use `core-prompt-versioning`).

Purpose: local models that fit the GPU and fail predictably.

Read first: textclone .env.example (the facts above), textclone/llm/ollama.py, base.py (GenParams,
num_ctx), router.py (fallback and smaller-context retry), breaker.py, textclone/resources/vram.py,
README requirements (16 GB GPU). Ollama docs via core-research-sources (keep_alive, num_ctx,
OLLAMA_* env vars), cited.

Steps:
1. List installed models (ollama list) — read only; never pull without the user's consent.
2. Estimate VRAM: weights by quantisation + KV cache by context length; leave headroom for metric
   models; record the estimate method in references/vram.md.
3. Choose context length and keep_alive per use (generation vs short checks).
4. Diagnose failures: Ollama down (LLM_OLLAMA_DOWN_001), model missing (LLM_MODEL_MISSING_003),
   timeout (LLM_TIMEOUT_002), out-of-memory; map each to the next action.
5. Record observed timings and memory per model in references/observations.md (no text content).
Decision rules: never stop or restart the user's Ollama; never pull models silently (large
downloads); MAX_LOADED_MODELS=1 means switching models unloads the other → batch by model.
Anti-patterns: raising num_ctx "just in case"; guessing VRAM without measuring.
Evidence: model list, VRAM estimate vs observed, settings chosen.

Evals:
T: "which model fits on my GPU with 8k context?" | "ollama keeps timing out on qwen3" | "should I
use q8 or q4?" | "the second model unloads the first, why?" | "keep the model warm between runs"
N: "rewrite the rewrite prompt" → core-prompt-versioning | "the JSON from the model is broken" →
core-structured-output | "generation is slow overall" → textclone-latency

Trial: produce the VRAM estimate for the three models in .env.example at num_ctx 4096 and 8192,
showing the method; mark which estimates are unverified.

Refine signals: OOMs or timeouts the skill didn't predict.
```

---

## `core-prompt-versioning` · P1

```text
Build the skill core-prompt-versioning. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when adding or changing an LLM prompt template: add a new versioned template instead of editing one that training or evaluations depend on, and record why. Not for Textclone train/serve parity details (use `textclone-prompt-parity`).

Purpose: prompts change safely and traceably.

Read first: textclone textclone/llm/prompts.py (SYSTEM_RULES, REWRITE, BRIEF, REPLY, REVISE,
SURGERY, EXTRACT_FACTS, FACT_CHECK, FORMAT_BLOCK; the _T registry; render()), plan.md §2 invariant
5, tasks.md G7 (stop if a fix needs an existing template changed).

Steps:
1. Find every consumer of the template (grep render("<name>") and the fine-tune dataset).
2. If any consumer is training or a frozen benchmark → add a new template name (e.g. rewrite_v2);
   never edit the old one.
3. Write the new template; register it; route only the new code path to it.
4. Evaluate old vs new on the benchmark (core-llm-eval) before switching defaults.
5. Record: name, date, reason, eval result.
Decision rules: editing an existing template is a stop condition in textclone; whitespace changes
count as edits; prompts never contain personal text.
Anti-patterns: tweaking prompts without an eval; overwriting a template "to fix a typo".
Evidence: consumers found, new template name, eval comparison.

Evals:
T: "improve the rewrite prompt" | "add a prompt for email mode" | "the reply template needs the
facts list" | "change the system prompt wording" | "version the prompts properly"
N: "train/serve parity check in textclone" → textclone-prompt-parity | "model returns invalid
JSON" → core-structured-output | "which model to use" → core-ollama-models

Trial: plan (no code) adding a "continue" template for textclone roadmap 09 step 3, listing
consumers and the eval plan.

Refine signals: any in-place template edit.
```

---

## `core-structured-output` · P2

```text
Build the skill core-structured-output. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when an LLM must return JSON or another structure: schema, validation, repair, bounded retries, and failing loudly instead of guessing. Not for prompt wording (use `core-prompt-versioning`).

Purpose: machine-readable model output you can trust.

Read first: textclone textclone/llm/json_repair.py, prompts.py (FACTS_SCHEMA, FACT_CHECK_SCHEMA),
errors.py (MalformedOutput LLM_MALFORMED_004), docs/roadmap/05-generation-accuracy/PLAN.md step 2
(honest fallbacks).

Steps:
1. Define the schema; pass it to the model if the backend supports structured output.
2. Validate every response; repair only syntactic issues (quotes, trailing commas).
3. Retry with the validation error at most N times; then raise the structured error.
4. Never fill missing fields with defaults that look like real answers; mark them unverified.
Decision rules: a fallback path must mark results as degraded, never as passed.
Anti-patterns: regex-extracting JSON and hoping; silent defaults.
Evidence: schema, validation failures seen, retry counts.

Evals:
T: "the fact extractor returns broken JSON sometimes" | "make the model output a list reliably" |
"validate the LLM's response against a schema" | "what happens when the JSON can't be repaired?"
| "add structured output for the critic"
N: "improve the prompt wording" → core-prompt-versioning | "model times out" →
core-ollama-models | "fact check reports pass when it fell back" → textclone-convergence-debug

Trial: write the validation-and-retry design for a synthetic schema and run it against 6 canned
malformed responses (trial folder).

Refine signals: malformed outputs that slipped through.
```

---

## `core-llm-eval` · P1

```text
Build the skill core-llm-eval. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when judging whether an LLM change (prompt, model, settings, retrieval) helped: fixed benchmark, baseline run, change, paired comparison with confidence intervals. Not for logging the experiment (use `core-experiment-log`).

Purpose: no tuning without measurement.

Read first: textclone docs/roadmap/02-evaluation-harness/PLAN.md (design: held-out set, metrics,
bootstrap CIs, "no significant change" label, storage keyed by commit/model/profile/settings);
core-stats-sanity (when built).

Steps:
1. Freeze the benchmark: item ids and hashes; exclude them from retrieval/training while scoring.
2. Baseline: run on the current code; record commit, model, settings hash.
3. Change one thing; run the same items.
4. Paired comparison per item; bootstrap 95% CI of the mean difference (stdlib or numpy, which
   is installed).
5. Verdict: improved / worse / no significant change (CI crosses 0).
6. Hand the result to core-experiment-log.
Decision rules: different item sets are never compared; n < 30 → report "insufficient evidence";
live runs need the user's go-ahead (GPU time); mock runs only test the harness.
Anti-patterns: cherry-picked examples; comparing to a baseline from different settings.
Evidence: run ids, n, mean diff, CI, verdict.
references/: references/bootstrap.md (a 20-line paired bootstrap in Python).

Evals:
T: "did the new prompt actually improve anything?" | "compare mistral-nemo and qwen3 on our
benchmark" | "run the eval before and after this change" | "is a 2-point gain real?" | "measure the
effect of the retrieval fix"
N: "write down the experiment" → core-experiment-log | "check the judge is biased" →
core-judge-calibration | "blind test with the user" → textclone-blind-voice-test

Trial: run the paired bootstrap on two synthetic score lists (n=40) with a small true effect and
one with none; check the verdicts.

Refine signals: "improvements" that vanished on re-run.
```

---

## `core-judge-calibration` · P2

```text
Build the skill core-judge-calibration. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when a model or metric scores outputs (a grader, critic or detector): check it against human labels, measure agreement and bias, decide if it can be trusted. Not for comparing two system versions (use `core-llm-eval`).

Purpose: scores that mean something.

Read first: textclone docs/roadmap/05-generation-accuracy/PLAN.md step 9 (second-opinion grader),
docs/roadmap/07-detection-calibration/PLAN.md (held-out calibration, ≥30 human samples),
textclone/generate/critic.py.

Steps:
1. Collect labelled items (the user's labels or a documented reference set); at least 30.
2. Score them with the judge.
3. Measure: agreement (accuracy or correlation), confusion matrix, bias by length/register.
4. Decide: trusted / trusted with correction / not trusted.
5. Re-check when the judge model or profile changes (staleness).
Decision rules: a judge never grades its own outputs alone; disagreements are inspected, not
averaged away.
Anti-patterns: trusting a judge because it "sounds right".
Evidence: agreement numbers with n, the decision.

Evals:
T: "can we trust the critic's scores?" | "check the AI detector against human samples" | "is the
grader biased toward long outputs?" | "validate the second-opinion model" | "how often does the
judge agree with me?"
N: "compare prompts on the benchmark" → core-llm-eval | "calibrate textclone's detector" →
textclone-detect-calibration | "check retrieval" → core-retrieval-quality

Trial: compute agreement and a confusion matrix on a synthetic labelled set of 40 items.

Refine signals: judge verdicts the user disagreed with.
```

---

## `core-retrieval-quality` · P2

```text
Build the skill core-retrieval-quality. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when checking whether retrieval finds the right examples: recall@k on labelled queries, diversity of results, distance-score correctness, leakage. Not for overall output quality (use `core-llm-eval`).

Purpose: the model sees the best and most varied examples.

Read first: textclone textclone/generate/retrieval.py, textclone/embeddings/store.py and
encoders.py (sqlite-vec), docs/roadmap/05-generation-accuracy/PLAN.md step 5 (distance-to-cosine
fix), docs/roadmap/04-voice-profile/PLAN.md step 6 (MMR diverse exemplars).

Steps:
1. Build labelled queries: for each, the items that should come back (synthetic corpus).
2. Measure recall@k and MRR; check the distance → similarity conversion on known vectors.
3. Measure diversity (pairwise similarity of results; register and length spread).
4. Check leakage: evaluation items never retrieved during evaluation.
Decision rules: fix the conversion before tuning weights; diversity gains must not drop recall
below the baseline CI.
Anti-patterns: eyeballing results.
Evidence: recall@k, MRR, diversity numbers with n.

Evals:
T: "are the exemplars actually the best matches?" | "check the vector search scores" | "the
retrieved samples are all the same, fix diversity" | "measure recall of retrieval" | "is the
distance to cosine conversion right?"
N: "did the output get better?" → core-llm-eval | "dedup the corpus" → core-dataset-hygiene |
"embedding model choice" → none

Trial: on 3 synthetic vectors with known cosines, verify a distance→cosine conversion function.

Refine signals: bad exemplars seen in generation reports.
```

---

## `core-latency-budget` · P2

```text
Build the skill core-latency-budget. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when setting or checking time budgets for a pipeline: per-stage targets (first event, plan, draft, checks, total), measured with medians, and alerts when exceeded. Not for finding hot spots (use `core-perf-profiling`).

Purpose: speed goals the user can feel, tracked per stage.

Read first: textclone .env.example (TEXTCLONE_WALL_CLOCK_S=90, TEXTCLONE_MAX_ITERS=5),
docs/roadmap/README.md (first-event latency fix: 35.7 s → 0.2 s), docs/roadmap/05-generation-accuracy/PLAN.md step 11.

Steps:
1. List stages and their events (from the SSE stream or logs).
2. Measure each stage over 5+ runs (synthetic inputs, warm models); median and p90.
3. Set budgets with the user (e.g. first event < 1 s).
4. Add the measurement to reports; flag stages over budget.
Decision rules: budgets are measured warm and cold separately; never trade correctness checks for
speed without the user.
Anti-patterns: one total number only.
Evidence: the stage table with median/p90 vs budget.

Evals:
T: "set time targets for each stage of generation" | "how long should the first event take?" |
"track which stage blows the budget" | "define latency goals" | "is the wall clock limit
reasonable?"
N: "profile the slow function" → core-perf-profiling | "speed up textclone generation" →
textclone-latency | "the model times out" → core-ollama-models

Trial: compute the stage table from a synthetic SSE log with timestamps.

Refine signals: user complaints about slowness in a stage within budget.
```

---

## `core-experiment-log` · P1

```text
Build the skill core-experiment-log. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use whenever trying an idea to improve quality or speed: log hypothesis, change, metric, result, verdict and keep/revert, so failed ideas aren't repeated. Not for running the measurement itself (use `core-llm-eval`).

Purpose: institutional memory for experiments.

Read first: textclone docs/roadmap/02-evaluation-harness/PLAN.md (run keys: commit, model,
profile, settings hash); docs/AI_HANDOFF.md style.

Steps:
1. Before the change: write the hypothesis and the predicted effect with the metric.
2. Check the log for the same or similar idea; if tried, read its result first.
3. After measuring: record result, CI, verdict, keep/revert, commit.
4. Revert if not kept; link the entry from the handoff.
Decision rules: entries are append-only; negative results are recorded with equal care; no entry
without a metric.
Anti-patterns: logging only wins; vague hypotheses.
Evidence: the entry.
references/: references/entry-template.md. The log lives in the project at a path the user
approves (propose docs/experiments.md).

Evals:
T: "let's try lowering the temperature, keep track" | "have we tried MMR before?" | "record the
result of this experiment" | "log that the new template didn't help" | "start an experiment on
retrieval weights"
N: "measure if it helped" → core-llm-eval | "decide a design choice" → core-decision-record |
"update the handoff" → core-handoff-writer

Trial: write two entries for synthetic experiments (one kept, one reverted) and show the
duplicate-check step finding the second idea.

Refine signals: repeated experiments.
```
