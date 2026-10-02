# Prompts: 3.7 Data and statistics

Batch name: `core-data`. Paste one block per message.

---

## `core-stats-sanity` · P1

```text
Build the skill core-stats-sanity. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use before stating any quantitative claim (improved, worse, faster, more accurate): check sample size, spread, confidence interval and effect size. Not for designing the benchmark run (use `core-llm-eval`). Runs only when invoked by name. Writes .agents/runs/core-stats-sanity/.

Purpose: numbers that mean what they say. The user works best with statistics, so claims must be
statistically honest.

Read first: textclone docs/roadmap/README.md (live results: 11 generations, 0 passed — a small-n
example), docs/roadmap/07-detection-calibration/PLAN.md (≥30 human samples), 02 PLAN (bootstrap
CIs).

Rules (references/rules.md, each with a worked synthetic example):
- Report n, the centre (mean/median), spread (SD/IQR) and a 95% CI for every claim.
- n < 30 → "insufficient evidence" unless the effect is huge and the test says so.
- Paired data → paired tests/bootstrap; independent → unpaired.
- Effect size alongside p-values (Cohen's d or the mean difference in metric units).
- Multiple comparisons → say how many were tried.
- Percentages always with the counts (e.g. "9/11 = 82%").
- Distinguish "no evidence of effect" from "evidence of no effect".

Steps:
1. Identify the claim and the data behind it.
2. Compute n, centre, spread, CI (stdlib statistics or numpy; numpy is installed in textclone).
3. Apply the rules; rewrite the claim to match the evidence.
4. Add a one-line plain-language reading.
Decision rules: when the rules fail, the claim is downgraded, never the rules; don't round to
hide spread.
Anti-patterns: "it improved by 3%" without n or CI; bar charts without error bars.
Evidence: the computed table and the rewritten claim.

Evals:
T: "the score went from 82 to 85, is that real?" | "can I say the new model is better?" | "check
my numbers before I put them in the report" | "what does 9 out of 11 tell us?" | "is the
difference significant?"
N: "run the benchmark before and after" → core-llm-eval | "log the experiment" →
core-experiment-log | "make a chart" → none

Trial: three synthetic claims (one valid, one small-n, one with no CI); rewrite each correctly.

Refine signals: claims later contradicted by more data.
```

---

## `core-dataset-hygiene` · P2

```text
Build the skill core-dataset-hygiene. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when preparing data for training, calibration or evaluation: dedupe, split by document to prevent leakage, balance, record provenance, freeze manifests. Not for growing Textclone's corpus (use `textclone-corpus-growth`). Runs only when invoked by name. Writes .agents/runs/core-dataset-hygiene/.

Purpose: datasets whose results can be trusted and reproduced.

Read first: textclone textclone/ingest/dedup.py (LSH), textclone/finetune/dataset.py (exemplar
exclusion, masking), docs/roadmap/08-learning-finetune/PLAN.md step 8 (dataset quality), 02 PLAN
(frozen manifest with ids and hashes), 03 PLAN step 2 (cap sample dominance).

Steps:
1. Inventory: items, sources, sizes, labels; flag any single source over a share threshold.
2. Dedupe exact and near-duplicates (within and across splits).
3. Split by document/thread, never by sentence; stratify by register and length.
4. Check leakage: no item (or near-duplicate) in both train and eval.
5. Record provenance per item; freeze a manifest (ids + hashes).
Decision rules: a dominant source is capped or chunked; edited model outputs are never labelled as
human (provenance); the manifest is the only definition of the set.
Anti-patterns: random sentence-level splits; re-splitting between experiments.
Evidence: the inventory table, dedup counts, leakage check, manifest hash.

Evals:
T: "prepare the fine-tune dataset" | "make sure eval samples aren't in training" | "one document
dominates the data, fix the balance" | "split the data properly" | "freeze the benchmark set"
N: "collect more samples" → textclone-corpus-growth | "label where samples came from in
textclone" → textclone-provenance | "check retrieval recall" → core-retrieval-quality

Trial: on a synthetic set of 60 items with planted duplicates and a dominant source, produce the
clean split and manifest.

Refine signals: leakage found after a result was reported.
```
