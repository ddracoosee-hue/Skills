# Prompts: 5.1 Textclone voice quality

Project skills may cite exact Textclone paths. They run in a Textclone worktree (core-worktree),
with `TEXTCLONE_DATA_DIR` set to a temporary folder and synthetic data. They never read
`data\textclone.db` or corpus text. Batch name: `textclone-voice`. Paste one block per message.

The roadmap's measured state (docs/roadmap/README.md, snapshot 2026-09-27):
- 8 samples;
- 2 registers;
- one sample holds about 65% of all tokens;
- 11 generations: 0 passed, 9 partial (scores 79–88 against targets of 85–86), 2 cancelled.

Re-check these numbers in the current handoff. Skills cite them only as a dated example.

---

## `textclone-eval-harness` · P1

```text
Build the skill textclone-eval-harness. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring. Build after core-llm-eval and
core-stats-sanity.

Description (verbatim; change only if R2 fails):
Use when measuring Textclone's voice fidelity: build the frozen benchmark, run it, compare to a baseline with confidence intervals. Not for generic eval method (use `core-llm-eval`) or blind tests (use `textclone-blind-voice-test`). Runs only when invoked by name. Writes .agents/runs/textclone-eval-harness/.

Purpose: a repeatable answer to "does it sound more like me now?"

Read first: docs/roadmap/02-evaluation-harness/PLAN.md (design, steps 1–7), textclone/generate/loop.py
(Generator.run), textclone/metrics/*, textclone/profile/builder.py (neutralize stage),
textclone/finetune/dataset.py (exclusion logic to copy), textclone/cli/main.py.

Steps:
1. Check which roadmap 02 steps exist in the code (grep "eval" in cli/ and db/schema/); never
   assume.
2. Benchmark: held-out samples + neutral paraphrases, frozen manifest (ids + hashes), excluded from
   retrieval/exemplars/training during scoring.
3. Run: per item metrics (style cosine, z-distance on ROBUST_KEYS, P(user) if a classifier exists,
   BERTScore/EMD, AI composite, status, iterations, calls, wall time); keyed by commit, model,
   profile version, calibration version, settings hash.
4. Compare: paired bootstrap CIs; "no significant change" inside the interval.
5. Smoke: mock-router run proves the harness works without Ollama.
Decision rules: live runs need the user's approval (GPU time, personal corpus stays local); the
results under data/eval/ are git-ignored; with the current corpus size, report "insufficient
evidence" honestly.
Anti-patterns: benchmark items leaking into exemplars; comparing runs with different manifests.
Evidence: manifest hash, run keys, the comparison table.

Evals:
T: "does the new profile make the output sound more like me?" | "run the textclone benchmark" |
"set up the voice fidelity eval" | "compare this branch's generation against the baseline" | "build
the held-out set"
N: "generic: compare two prompts" → core-llm-eval | "let me guess which text is mine" →
textclone-blind-voice-test | "why didn't this run hit 85?" → textclone-convergence-debug

Trial: in a worktree, run whatever exists of the harness against the mock router and synthetic
samples; if nothing exists yet, produce the gap list against roadmap 02 steps.

Refine signals: eval results that disagree with blind-test results.
```

---

## `textclone-blind-voice-test` · P1

```text
Build the skill textclone-blind-voice-test. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring. Build after core-stats-sanity.

Description (verbatim; change only if R2 fails):
Use when the user wants to judge the voice themselves: a blind test pairing their real text with generated text, shuffled, scored by whether they can tell which is theirs. Not for automatic metrics (use `textclone-eval-harness`). Runs only when invoked by name. Writes .agents/runs/textclone-blind-voice-test/.

Purpose: the truest measure of the product. If the user can't tell, the voice is right.

Read first: textclone README.md (product intent), docs/roadmap/02-evaluation-harness/PLAN.md (held-out set),
web/app/analyze and web/lib/api.ts (where a local test UI could live), core-stats-sanity.

Protocol the skill must specify (references/protocol.md):
- Items: held-out real samples (never in exemplars) and generated rewrites of their neutral
  paraphrases, matched by register and length.
- Each trial: two texts, A/B order random (seeded), the user picks "mine".
- n ≥ 40 trials for a usable answer; record only ids, choice, correct/incorrect, register,
  response time — never text.
- Analysis: accuracy with a 95% binomial CI (Wilson); chance = 50%. The voice "passes" when the CI
  includes 50% and accuracy ≤ 60%. Break down by register.
- Runs locally only: texts shown in the local UI or CLI, never copied into files, logs or chat.

Steps:
1. Check eligibility: enough held-out samples per register (else report how many are missing).
2. Generate the paired set (the user's machine, the user's approval for GPU time).
3. Run the session (UI or CLI), store the anonymous results.
4. Analyse with CIs; report per register.
5. Feed failures back: registers the user identifies easily become targets for
   textclone-convergence-debug and textclone-registers.
Decision rules: the agent never sees or prints the texts; small n → report the CI, not a verdict.
Anti-patterns: letting the user see labels; reusing items across sessions.
Evidence: n, accuracy, Wilson CI, per-register table.

Evals:
T: "let me test whether I can spot my own writing" | "set up a blind test of the clone" | "can I
tell the difference between me and the model?" | "run a human evaluation of the voice" | "turing
test my voice clone"
N: "run the automatic benchmark" → textclone-eval-harness | "is a 3-point gain significant?" →
core-stats-sanity | "detect AI text" → textclone-ai-tells

Trial: simulate 40 trials with synthetic choices at 70% and at 52% accuracy; compute Wilson CIs and
verdicts.

Refine signals: user feedback that the test felt unfair (length or topic gave it away).
```

---

## `textclone-corpus-growth` · P1

```text
Build the skill textclone-corpus-growth. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when planning how to grow the user's writing corpus: which sources, which importers, quality gates, register balance, consent, and progress toward thresholds. Not for writing one new importer (use `textclone-ingest-adapter`). Runs only when invoked by name. Writes .agents/runs/textclone-corpus-growth/.

Purpose: the single biggest accuracy lever (roadmap 03).

Read first: docs/roadmap/03-corpus-ingestion/PLAN.md (steps 1–11), docs/roadmap/README.md
(thresholds: ≥30 human samples for calibration, ≥200 for fine-tuning, ideally thousands),
textclone/finetune/README.md (200+, ideally 3k–10k), textclone/ingest/ (existing importers: chat
discord/imessage/whatsapp, email_, social, extract docx/pdf/html/gdrive/sheets/slides/ocr/web).

Steps:
1. Get counts only (textclone samples stats via the CLI, run by the user or on a read-only copy):
   samples per register, per source, token share of the largest sample.
2. Compare to thresholds per feature (calibration, classifier, fine-tune, stable registers).
3. Plan sources the user has (they choose): existing importers first; missing ones → adapter
   tasks.
4. Quality gates: role detection, dedup, quoted-text filtering, dominance cap.
5. A progress table the user can update.
Decision rules: collecting data is the user's action (roadmap 03 step 1); never read the content;
other people's writing only with consent and in a separate scope.
Anti-patterns: importing everything without role checks; counting quoted text as the user's.
Evidence: the counts table, the plan, the thresholds gap.

Evals:
T: "how do I get enough samples for fine-tuning?" | "plan the data collection" | "which of my
sources should I import first?" | "how far are we from the calibration threshold?" | "grow the
corpus safely"
N: "write a Discord importer" → textclone-ingest-adapter | "dedupe the dataset" →
core-dataset-hygiene | "label sample provenance" → textclone-provenance

Trial: produce the plan from a synthetic counts table (8 samples, 2 registers, one dominant).

Refine signals: imports that degraded the profile.
```

---

## `textclone-ingest-adapter` · P2

```text
Build the skill textclone-ingest-adapter. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when adding or fixing a Textclone importer for a source format (chat export, email, docx, social, notes): extract, clean, segment, role detection, fixtures, tests. Not for planning which sources to collect (use `textclone-corpus-growth`). Runs only when invoked by name. Writes .agents/runs/textclone-ingest-adapter/.

Read first: textclone/ingest/pipeline.py, types.py, cleaning.py, segment.py, classify_role.py,
quality.py, dedup.py, chat/whatsapp.py (a full example), extract/docx.py; tests/unit/test_ingest.py;
tests/fixtures/ (WhatsApp Chat with Sam.txt, discord_export.json, reddit_comments.csv,
case_study_response.docx, broken_export.json); docs/roadmap/03-corpus-ingestion/PLAN.md steps 5–7, 10; plan.md
(the timezone TypeError that quarantines whole exports).

Steps:
1. Study the closest existing importer; copy its structure.
2. Write a synthetic fixture for the new format (including a malformed case).
3. Test first: expected samples, roles, timestamps (timezone-aware), quoted text excluded.
4. Implement extract → normalise → segment → role → quality; errors as IngestError subclasses
   with hints (ING_* codes).
5. One bad record never quarantines the whole file.
Decision rules: the user's messages only (role detection); habits (greetings, sign-offs) are kept
as features (03 step 6); never add a dependency without core-dependency-audit.
Anti-patterns: real exports as fixtures; dropping timezones.
Evidence: fixture, tests, counts per role from the fixture.

Evals:
T: "add an importer for Telegram exports" | "the whatsapp import quarantines everything" | "support
importing my Google Docs folder" | "emails import the quoted replies too, fix it" | "write a
reddit importer"
N: "which sources should I import?" → textclone-corpus-growth | "dedup is missing near
duplicates" → core-dataset-hygiene | "OCR a pdf" → none

Trial: in a worktree, add a synthetic "plain chat log" format importer to a trial branch with a
fixture and passing test; do not merge.

Refine signals: import errors in the field.
```

---

## `textclone-provenance` · P1

```text
Build the skill textclone-provenance. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when any text enters Textclone's corpus or learning loop: label where it came from (human, edited model draft, approved output, imported) so model text is never learned as the user's. Not for dedup or splits (use `core-dataset-hygiene`). Runs only when invoked by name. Writes .agents/runs/textclone-provenance/.

Purpose: stop the voice drifting toward the model's.

Read first: docs/roadmap/08-learning-finetune/PLAN.md step 2 (feedback provenance) and step 3
(thumbs-up as weak positive), docs/roadmap/README.md problem 6 ("edited LLM drafts are ingested as
pure human writing"), textclone/db/schema/v001.sql (sample/document columns),
textclone/db/repo_corpus.py, textclone/ingest/pipeline.py.

Steps:
1. Map every path where text enters: imports, paste, feedback edits, approved outputs.
2. For each, the provenance label it gets today (from code) and the label it should get.
3. Define labels and their uses: which feed profile, exemplars, calibration (human only),
   fine-tune (human only), retrieval.
4. Plan the schema change (via textclone-db-migration and core-migration-rehearsal); tests per path.
Decision rules: unknown provenance → excluded from human-only uses; edited drafts are never
"human"; the user can review and relabel.
Anti-patterns: a boolean "is_human" with no source; relabelling silently.
Evidence: the entry-path table and the label-use matrix.

Evals:
T: "my edits to drafts are being learned as my writing" | "track where each sample came from" |
"should approved outputs feed the profile?" | "make sure model text never enters calibration" |
"label the sources of samples"
N: "split train and eval" → core-dataset-hygiene | "import emails" → textclone-ingest-adapter |
"fine-tune safety rules" → textclone-finetune-safety

Trial: build the entry-path table from the code (read only) and list paths with wrong labels.

Refine signals: model-like drift in profile features.
```

---

## `textclone-stylometry-metric` · P2

```text
Build the skill textclone-stylometry-metric. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when adding or changing a Textclone style feature or check (sentence shape, punctuation, casing, function words, vocabulary): compute it, band it from the user's writing, test it. Not for AI-likeness tells (use `textclone-ai-tells`). Runs only when invoked by name. Writes .agents/runs/textclone-stylometry-metric/.

Read first: textclone/profile/features.py, aggregate.py, targets.py (build_targets, _band p10/p90,
_widen, ROBUST_KEYS), textclone/generate/checks/style.py, textclone/nlp/, docs/roadmap/04-voice-profile/PLAN.md
steps 1, 7, 8 (function-word weight fix, new features, weighted bands), tests/unit/test_profile.py.

Steps:
1. Define the feature: formula, unit, tokenisation, edge cases (short texts, emoji, code).
2. Implement in features.py with tests on synthetic texts with known answers.
3. Check robustness: stable across splits of the same author (variance), distinct between
   authors (synthetic contrast) — only then add it to ROBUST_KEYS/bands.
4. Band it from the user's writing (p10/p90, widened for small data).
5. Wire the check; evaluate with textclone-eval-harness.
Decision rules: a feature unstable on small corpora stays informational, not a hard check;
weights must align with their features (the step 1 bug).
Anti-patterns: features that measure topic instead of style.
Evidence: formula, tests, stability numbers, eval result.

Evals:
T: "add a feature for how often I use em dashes" | "the casing check is too strict" | "measure
sentence length variety" | "is the function word feature weighted right?" | "add a new style
metric"
N: "the AI detector flags my text" → textclone-ai-tells | "separate work and casual voice" →
textclone-registers | "speed up profile build" → core-perf-profiling

Trial: implement (trial branch) a synthetic "exclamation rate" feature with tests and a stability
check on synthetic texts.

Refine signals: checks that fail human-written text.
```

---

## `textclone-registers` · P2

```text
Build the skill textclone-registers. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when working on Textclone registers, neutralising or the style card: how contexts like work vs casual are detected, separated, described with evidence and used as targets. Not for single metric formulas (use `textclone-stylometry-metric`). Runs only when invoked by name. Writes .agents/runs/textclone-registers/.

Read first: textclone/profile/registers.py, neutralize.py, style_card.py, builder.py, lexicon.py;
docs/roadmap/04-voice-profile/PLAN.md steps 2–6, 9 (small-corpus registers, card edits,
evidence-gated claims, per-register lists, diverse exemplars, recency).

Steps:
1. Show how registers are formed today (code) and with how much data.
2. For changes: small-corpus rule (one register below threshold unless metadata says otherwise).
3. Style card: claims only when enough tokens support them ("never/always" gated); user edits kept.
4. Per-register lists (openers, closers, slang, emoji, hedges).
5. Tests on synthetic corpora with two clearly different registers.
Decision rules: a claim without evidence count isn't shown; exemplars are diverse (MMR).
Anti-patterns: inventing registers from 4 samples.
Evidence: register stats on synthetic data; card output.

Evals:
T: "my work and casual voices are mixed up" | "the style card says I never use emoji, that's
wrong" | "how are registers decided?" | "add per-register sign-offs" | "the neutralize step loses
meaning"
N: "add a metric" → textclone-stylometry-metric | "multiple profiles for different people" →
textclone-multi-profile | "retrieval diversity" → core-retrieval-quality

Trial: run the profile build on two synthetic registers in a temp data dir; check the card's
claims all have evidence counts.

Refine signals: card claims the user rejects.
```

---

## `textclone-ai-tells` · P2

```text
Build the skill textclone-ai-tells. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when working on Textclone's AI-likeness tells, heatmap or Analyze results, always relative to the user's own baseline. Not for calibrating thresholds (use `textclone-detect-calibration`). Runs only when invoked by name. Writes .agents/runs/textclone-ai-tells/.

Read first: textclone/detect/tells.py, heatmap.py, classifiers.py, textclone/generate/checks/ai.py,
textclone/metrics/lm.py, docs/roadmap/07-detection-calibration/PLAN.md steps 5, 7 (heatmap consistency, GLTR z-score vs
user baseline), tests/unit/test_detect.py, web/app/analyze.

Steps:
1. List current tells and how each is scored (code).
2. For each change: is it measured relative to the user's baseline? If not, make it so.
3. Heatmap: sentence scores consistent with the document score.
4. Tests with stubbed models (07 step 10).
Decision rules: a tell common in the user's own writing is not an AI tell for them; unavailable
detectors → unverified, not "human".
Anti-patterns: generic AI-word lists applied to everyone.
Evidence: tells table, tests.

Evals:
T: "the analyzer flags my own writing as AI" | "add a tell for repetitive sentence openers" |
"heatmap colours don't match the score" | "explain why this sentence is red" | "normalise GLTR to
my baseline"
N: "calibrate the detector" → textclone-detect-calibration | "add a style metric" →
textclone-stylometry-metric | "judge agreement" → core-judge-calibration

Trial: write stubbed-model tests for find_tells on synthetic text (trial branch).

Refine signals: false positives on the user's text.
```

---

## `textclone-detect-calibration` · P2

```text
Build the skill textclone-detect-calibration. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring. Build after core-judge-calibration.

Description (verbatim; change only if R2 fails):
Use when calibrating Textclone's AI-likeness score or the P(user) classifier: held-out human and model samples, activation gates, staleness, health checks. Not for designing tells (use `textclone-ai-tells`). Runs only when invoked by name. Writes .agents/runs/textclone-detect-calibration/.

Read first: docs/roadmap/07-detection-calibration/PLAN.md (steps 1–11), textclone/detect/calibrate.py,
textclone/classifier/ (data, features, registry, train), tests/unit/test_classifier_registry.py.

Steps:
1. Check data sufficiency (≥30 human held-out; negatives from a designated base model).
2. Calibrate on held-out data; record profile version and observer model (staleness).
3. Activation gate: a new classifier replaces the old only when it clears the gate.
4. Health checks report missing/stale calibration.
5. Jobs are resumable and respect the GPU lock.
Decision rules: insufficient data → don't calibrate; report the gap.
Anti-patterns: calibrating on training data; deactivating a model before the new one passes.
Evidence: data counts, gate result, versions recorded.

Evals:
T: "recalibrate the AI score" | "train the style classifier" | "is the calibration stale?" | "the
new classifier is worse, don't activate it" | "how many samples do I need to calibrate?"
N: "the heatmap is inconsistent" → textclone-ai-tells | "judge vs human labels" →
core-judge-calibration | "grow the corpus" → textclone-corpus-growth

Trial: with stubbed models and synthetic data, run the gate logic and show a failing candidate
is not activated.

Refine signals: stale calibrations in use.
```

---

## `textclone-finetune-safety` · P3

```text
Build the skill textclone-finetune-safety. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when preparing, running or promoting a Textclone fine-tune: data minimums, prompt parity, masking, exemplar exclusion, VRAM discipline, A/B against base, rollback. Not for prompt template changes (use `textclone-prompt-parity`). Runs only when invoked by name. Writes .agents/runs/textclone-finetune-safety/.

Read first: textclone/finetune/README.md (200+ samples, ideally 3k–10k; unsloth; ~25 GB disk;
Ollama unloaded), dataset.py, train_qlora.py, export_gguf.py; docs/roadmap/08-learning-finetune/PLAN.md steps 5–11;
tests/unit/test_finetune_dataset.py.

Steps:
1. Gate: training-eligible sample count, provenance (human only), dedup and split.
2. Parity: training prompts rendered by the same templates as serving.
3. Masking: assistant-only loss; exemplars excluded.
4. VRAM: Ollama unloaded; the user's approval for long GPU runs and installs.
5. A/B: base vs fine-tuned on the eval harness; promote only on a significant win; keep rollback.
Decision rules: below the minimum → stop; installs (unsloth, triton-windows) need approval.
Anti-patterns: training on edited drafts; promoting on vibes.
Evidence: the gate table, parity check, A/B result.

Evals:
T: "can I fine-tune yet?" | "train a model on my writing" | "promote the fine-tuned model" |
"check the training data is safe" | "roll back to the base model"
N: "change the rewrite prompt" → textclone-prompt-parity | "dedup the dataset" →
core-dataset-hygiene | "VRAM for inference" → core-ollama-models

Trial: run the gate on a synthetic count table and a dataset build with stub data (no training).

Refine signals: fine-tunes that underperformed base.
```
