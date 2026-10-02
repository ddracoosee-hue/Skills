# Muse skills catalog

This is the full list of skills planned for this repo. It is a list only: no skill is written yet.
Build prompts for Muse come later, in batches, starting with the P1 skills.

The list is ordered so it reads top to bottom as one path:

1. how every skill is built;
2. the foundation that makes skills portable;
3. the shared core, from planning a product to releasing it;
4. the flows that chain core skills together;
5. the Textclone pack;
6. the Orion pack.

Each table row is one skill, with what it does and why it matters for building better products.

- **New** marks a skill added in this round. Rows without it are from the first list.
- **P1** means build first. **P2** means next. **P3** means build when the need first comes up.

## 1. How every skill is built

Adding more skills is not automatically better. Muse reads every skill's description to decide which
one to use. Many skills with overlapping descriptions make it pick the wrong one or none at all. So
each skill must be narrow, and each must follow the same anatomy:

| Part | Rule |
| --- | --- |
| Frontmatter | `name` matches the folder name. `description` is at most 250 characters and has two parts: "Use when …" and "Not for … (use `<other-skill>`)". |
| Inputs | Project facts come from `.muse/project.json` and are never hard-coded. |
| Steps | Numbered steps, each with a "done when" condition that can be checked. |
| Decision rules | The judgement calls written as if-then rules: when to stop, when to ask, which option wins. |
| Anti-patterns | The specific mistakes this skill exists to prevent. |
| Evidence | What the final report must show: the commands run, their output, and anything that could not be checked. |
| `references/` | Long material, such as checklists, examples and tables, goes in separate files. Muse reads them only when a step needs them, which keeps `SKILL.md` short (at most about 150 lines). |
| `evals.md` | 3 to 5 requests that should trigger the skill and 2 or 3 near-misses that should not. `core-skill-evals` runs these. |

**Supplemental Muse facts** ([`docs/MUSE-REFERENCE.md`](docs/MUSE-REFERENCE.md), applied in
[`prompts/00-BUILD-PROTOCOL.md`](prompts/00-BUILD-PROTOCOL.md) §8) refine this anatomy without
changing it:
- Muse runs in PowerShell on this PC.
- A skill's instructions last one turn, so skills that pause save their state.
- Approval questions use one fixed wording.
- Steps name exact commands.
- SKILL.md holds no dates.
- Skill text must be safe to publish.
- Muse features are used only once [`VERIFIED.md`](VERIFIED.md) confirms them.

## 2. Foundation: building, testing and improving skills

| Skill | Pri | What it does and why |
| --- | --- | --- |
| `core-project-profile` | P1 | Creates and validates `.muse/project.json`: venv, commands, ports, protected paths, handoff files, known flakes, privacy patterns. Every shared skill reads it. |
| `core-skill-authoring` **New** | P1 | The anatomy above, as a procedure. Muse uses it to write every other skill, so all of them come out consistent. |
| `core-skill-evals` **New** | P1 | Runs each skill's `evals.md` and reports when the skill fires and when it misfires. A skill edit is not done until its evals pass. |
| `core-skill-maintenance` | P2 | Keeps skills in step with project changes and retires stale ones. Changes go to the `Skills` repo (`ddracoosee-hue/Skills`) as commits. |
| `core-trace-report` **New** | P2 | Supplemental. At the end of a task, records what ran (lane and model, skills, checks) and pins it to a redacted Muse session export by its SHA-256. |
| `core-session-audit` **New** | P2 | Supplemental. Reads a past session's export and lists approvals, side effects, skills loaded and failed tools. Flags anything that wrote without approval. |
| `core-retro` **New** | P2 | After each phase, records what failed or wasted time and proposes an edit to the skill that should have prevented it. Proposals only; the user approves them. |

## 3. Shared core

### 3.1 Session, judgement and autonomy

| Skill | Pri | What it does and why |
| --- | --- | --- |
| `core-session-start` | P1 | The startup reading order, the git state, and a scope statement before any edit. |
| `core-worktree` | P1 | Creates, names, records and removes worktrees. Never touches another agent's worktree. |
| `core-recheck-loop` | P1 | Runs the checks, fixes, and checks again, up to 3 cycles, then stops and reports. |
| `core-commit` | P1 | Logical commits with clear messages. No private data and no unrelated formatting. |
| `core-phase-gate` | P1 | A phase passes only when every gate check exits 0. Stops at user checkpoints. |
| `core-escalation` | P1 | When to stop and ask. Expanded with a decision matrix: is the change reversible, does it stay in scope, is it visible outside the project? |
| `core-long-run` **New** | P1 | Rules for running unattended: time and retry budgets, stop conditions, a short status note after each task, and never "silently continue after a failure". |
| `core-context-budget` **New** | P2 | What to read first, how to handle very large files, and summarising into the handoff so the next session starts warm. |
| `core-report-writer` | P2 | The report format: what changed, why, the checks with their output, the limits, and the next step. |
| `core-handoff-writer` | P1 | Updates `AI_HANDOFF.md` with dated facts. Separates what is done from what is proposed. |

### 3.2 Product thinking (new group)

These skills sit before any code. They decide whether the right thing gets built.

| Skill | Pri | What it does and why |
| --- | --- | --- |
| `core-product-brief` **New** | P1 | One page for each feature: the user, the job they are trying to get done, the problem, one success measure, and what is out of scope. Without one, Muse builds what was literally asked rather than what was needed. |
| `core-acceptance-criteria` **New** | P1 | Turns the brief into testable "given / when / then" statements. These become the tests in `core-test-first`. |
| `core-scope-slicer` **New** | P1 | Cuts a feature into thin end-to-end slices that can each ship alone, with the riskiest slice first. |
| `core-premortem` **New** | P2 | Before building, imagines the feature has failed and lists the 5 most likely reasons. Each one becomes a guard or a test. |
| `core-decision-record` **New** | P2 | A short record of each significant choice: the context, the options, the decision, and what would make us revisit it. Stops Codex and Muse from re-arguing settled decisions. |
| `core-user-journey-walk` **New** | P1 | Walks the real flow end to end as the user would, in the running app, and logs every point of friction. This catches problems that unit tests cannot see. |
| `core-dogfood` **New** | P3 | Uses the product on a realistic task with synthetic data for 20 minutes, then files the friction log as tasks. |

### 3.3 UX, content and look

| Skill | Pri | What it does and why |
| --- | --- | --- |
| `core-information-architecture` **New** | P1 | Gives every action exactly one home and every page one job. Generalised from the Textclone "one-home" table. |
| `core-states-design` **New** | P1 | Designs every state of a screen: empty, loading, partial, error, offline, success. Most unfinished-looking products skip three of these. |
| `core-microcopy` **New** | P1 | Button labels, error messages and hints. Every error says what happened, why, and what to do next, matching the structured error contract. |
| `core-readability` **New** | P1 | Dyslexia-friendly reading: line length, spacing, font choice, plain language, one idea per paragraph. Applies to the UI and to docs. |
| `core-ux-heuristics` **New** | P2 | Reviews a screen against the 10 usability heuristics, scored with examples rather than opinions. |
| `core-motion` **New** | P2 | Motion with a purpose: duration tokens, easing, reduced-motion alternatives, and no motion that blocks input. |
| `core-onboarding` **New** | P3 | The first-run path: what a new user sees, the first success within 2 minutes, and sample data. |
| `core-visual-design-method` | P1 | Tokens, then measured rules, then a reference target, then a rubric. Night Scriptorium is the first instance. |
| `core-layout-audit` | P1 | The generic layout audit engine. Each project supplies its own contract and scenarios. |
| `core-a11y-review` | P1 | Keyboard paths, focus, contrast, labels and screen-reader names. |
| `core-nextjs16` | P1 | Next.js 16 conventions, checked against the installed docs and not from memory. |

### 3.4 Engineering quality

| Skill | Pri | What it does and why |
| --- | --- | --- |
| `core-test-first` | P1 | Writes a failing test from the acceptance criteria, then the code. |
| `core-debug-method` **New** | P1 | Reproduce, shrink to the smallest failing case, write a hypothesis log, test one variable at a time. Replaces guess-and-patch. |
| `core-git-bisect` **New** | P2 | Finds the commit that broke something, with a scripted check, and reports it. |
| `core-diff-self-review` **New** | P1 | Before any handoff, re-reads its own diff as a hostile reviewer would: edge cases, error paths, leftover debug code, scope creep. |
| `core-refactor-safely` **New** | P2 | Writes tests that pin current behaviour first, refactors in small steps, and proves the behaviour is unchanged. |
| `core-api-design` **New** | P2 | Endpoint and function contracts: naming, errors, versioning, backward compatibility. |
| `core-state-machines` **New** | P2 | Models jobs, runs and UI modes as explicit states and transitions, so no state is impossible or unreachable. |
| `core-concurrency-review` **New** | P2 | Threads, shared connections, races and cancellation. Textclone's roadmap lists two bugs of this kind. |
| `core-property-tests` **New** | P3 | Tests that generate many random inputs to find the edge cases a person would not write by hand. |
| `core-mutation-check` **New** | P3 | Deliberately breaks critical code to check that the tests notice. Measures test strength, not just coverage. |
| `core-type-hardening` **New** | P3 | Raises type-checking strictness one module at a time. |
| `core-perf-profiling` **New** | P2 | Measures before optimising: Python and React profilers, flame graphs, a before/after table. |
| `core-dependency-audit` **New** | P2 | New dependencies: licence, size, maintenance status, lockfile diff, and whether something already installed does the job. |
| `core-flake-triage` | P1 | Separates real failures from flaky ones with evidence. "Flake" is never a root cause. |
| `core-web-test` | P1 | Browser tests with Playwright against a production build. |
| `core-security-review` | P2 | Input handling, paths, secrets, local server exposure, dependency risks. |

### 3.5 Reliability, environment and release

| Skill | Pri | What it does and why |
| --- | --- | --- |
| `core-windows-env` | P1 | PowerShell, `npm.cmd`, path quoting, killing a whole process tree. |
| `core-port-safety` | P1 | Uses only the ports a project owns. Never stops a process on someone else's port. |
| `core-privacy-guard` | P1 | Keeps personal text, databases, `.env` and logs out of Git, handoffs and skills. |
| `core-backup-drill` **New** | P2 | Backs up an isolated copy, restores it, and compares the two. A backup that was never restored is unproven. |
| `core-migration-rehearsal` **New** | P2 | Copies the database, runs the migration on the copy, compares row counts and integrity, and tests rollback. |
| `core-crash-recovery` **New** | P2 | Kills the app mid-job and checks it resumes with nothing lost or duplicated. |
| `core-local-observability` **New** | P3 | Structured local logs with request IDs, and a "what happened" timeline for any failure. |
| `core-ci-setup` **New** | P2 | GitHub Actions that run the project's fast checks on every push. Textclone has no CI yet. |
| `core-release` **New** | P3 | Version, changelog, tag, release notes, and a smoke test of the built release. |
| `core-windows-packaging` **New** | P3 | Shortcuts, installer and first-run checks on a clean Windows profile. |

### 3.6 AI and LLM products

| Skill | Pri | What it does and why |
| --- | --- | --- |
| `core-ollama-models` | P1 | Expanded: model choice, VRAM budget on a 16 GB card, quantisation, context length, `keep_alive`. |
| `core-prompt-versioning` **New** | P1 | Prompts are versioned files. Changes add new templates, never edit old ones that fine-tunes depend on. |
| `core-structured-output` **New** | P2 | JSON schemas, repair, retries, and failing loudly rather than guessing. |
| `core-llm-eval` **New** | P1 | A fixed benchmark set, a baseline run, then a change, then a second run. Paired comparison with a confidence interval. No tuning without a measurement. |
| `core-judge-calibration` **New** | P2 | When a model scores another model's output, checks the scorer against human labels and measures its bias. |
| `core-retrieval-quality` **New** | P2 | Measures whether retrieval finds the right examples (recall@k), and checks that the examples are varied. |
| `core-latency-budget` **New** | P2 | Time budgets per stage (first event, plan, draft, checks), with measurements in a table. |
| `core-experiment-log` **New** | P1 | One entry per experiment: hypothesis, change, metric, result, and whether it was kept or reverted. Stops the team from repeating failed ideas. |

### 3.7 Data and statistics

| Skill | Pri | What it does and why |
| --- | --- | --- |
| `core-stats-sanity` **New** | P1 | Before any claim, checks the sample size, the confidence interval and the effect size. Refuses claims like "it improved" when there are fewer than 30 examples or the difference is noise. |
| `core-dataset-hygiene` **New** | P2 | Removes duplicates, prevents leakage between training and test data (split by document, never by sentence), and records where each item came from. |

### 3.8 Coordination and research

| Skill | Pri | What it does and why |
| --- | --- | --- |
| `core-codex-handoff` | P1 | Prepares a review request for Codex: intended behaviour, files, checks, uncertainties, where to look. |
| `core-roadmap-sync` | P2 | Ticks roadmap steps and keeps the plan files true to the code. |
| `core-task-authoring` | P2 | Writes tasks the way `tasks.md` does: exact files, done-when conditions, checks. |
| `core-research-sources` **New** | P2 | Online research with dated sources, confidence labels, and a clear split between documented facts and inference. |

## 4. Flows (new group)

Flows are the entry points you call by name. Each one chains core skills in a fixed order, so you
don't need to remember 115 skill names.

| Skill | Pri | Chain |
| --- | --- | --- |
| `core-flow-feature` **New** | P1 | product-brief → acceptance-criteria → scope-slicer → test-first → build → diff-self-review → user-journey-walk → handoff-writer |
| `core-flow-bugfix` **New** | P1 | debug-method → (git-bisect) → regression test → fix → recheck-loop → handoff-writer |
| `core-flow-ui-change` **New** | P1 | information-architecture → states-design → microcopy → build → layout-audit → a11y-review → visual rubric |
| `core-flow-experiment` **New** | P1 | experiment-log → llm-eval baseline → change → llm-eval → stats-sanity → keep or revert |
| `core-flow-release` **New** | P3 | backup-drill → migration-rehearsal → ci green → release |

## 5. Textclone pack

### 5.1 Voice quality: the core of the product (mostly new)

The roadmap's two biggest problems are too little data (8 samples) and no measure of how faithful
the voice is. These skills point Muse at those problems before anything else.

| Skill | Pri | What it does and why |
| --- | --- | --- |
| `textclone-eval-harness` | P1 | The fidelity benchmark. Runs `core-llm-eval` with Textclone's metrics. |
| `textclone-blind-voice-test` **New** | P1 | A blind A/B test: your real text and a generated text, shuffled, and you pick which one is yours. The rate at which you can't tell them apart is the truest measure of the product. |
| `textclone-corpus-growth` **New** | P1 | A plan to grow from 8 samples to 200 or more: which sources, which adapters, quality gates, a balance across registers, and consent. |
| `textclone-ingest-adapter` **New** | P2 | Adds a new source format (WhatsApp, Discord, Reddit, email, docx) with fixtures, cleaning and role detection. |
| `textclone-provenance` **New** | P1 | Labels where every sample came from, so edited model drafts are never stored as purely human writing. Prevents the voice from slowly drifting toward the model's. |
| `textclone-stylometry-metric` **New** | P2 | Adds or changes a style metric (sentence shape, punctuation, casing, function words) with target bands taken from your own writing. |
| `textclone-registers` **New** | P2 | Registers, neutralising and the style card: how "you at work" and "you with friends" are separated and measured. |
| `textclone-ai-tells` **New** | P2 | AI-likeness tells and the heatmap, always measured relative to your own baseline. |
| `textclone-detect-calibration` | P2 | Calibrates the detector with at least 30 human samples. |
| `textclone-finetune-safety` | P3 | Fine-tuning rules: the same prompts in training and use, masking, exemplar exclusion, a minimum data size. |

### 5.2 Generation engine

| Skill | Pri | What it does and why |
| --- | --- | --- |
| `textclone-generation-loop` | P1 | How the checked loop works: stages, targets, best-so-far, budgets, cancellation. |
| `textclone-convergence-debug` **New** | P1 | Diagnoses why a run stops short of target: inflated stage scores, fallbacks reported as passes, repairs aimed at the wrong sentence, length bands that fight a terse voice. |
| `textclone-critic-repair` **New** | P2 | Check priority order, and rolling back any repair that breaks a higher-priority check. |
| `textclone-new-task-type` **New** | P2 | The roadmap's 5-step pattern for a new task (variants, continue writing, email mode and so on), reusing the loop rather than adding a parallel pipeline. |
| `textclone-latency` **New** | P2 | Brings 19–128 s runs down by measuring each stage first (`core-latency-budget`). |
| `textclone-prompt-parity` | P1 | Training and serving use the same prompts. Old templates are never edited. |
| `textclone-llm-router` | P2 | The router, circuit breaker and JSON repair. |
| `textclone-compose-registry` | P2 | Formats, audiences, modifiers and regenerate modes. |
| `textclone-multi-profile` **New** | P3 | Several profiles ("me at work", or other authors who have consented), with a separate corpus for each and a strict privacy scope. |

### 5.3 Contracts, data and operations

| Skill | Pri | What it does and why |
| --- | --- | --- |
| `textclone-error-contract` | P1 | Error codes, hints, retry flag and request IDs, kept the same across API, CLI and UI. |
| `textclone-sse-contract` | P1 | Streaming events and their order. |
| `textclone-api-contract` | P1 | API request and response shapes, tested. |
| `textclone-db-migration` | P1 | Schema changes that stay compatible with existing data, rehearsed on a copy. |
| `textclone-ingest-pipeline` | P2 | Extract, clean, segment, deduplicate, quality check. |
| `textclone-profile-feature` | P2 | Adding a profile feature end to end. |
| `textclone-synthetic-fixtures` | P1 | Synthetic test data only. Never the real corpus. |
| `textclone-doctor-check` **New** | P2 | Adds a `textclone doctor` check, and a `--fix` only when the repair is safe to do automatically. |
| `textclone-jobs-recovery` **New** | P2 | Resuming jobs and the partial-result exit code 6, tested by killing a job mid-run. |
| `textclone-launcher` **New** | P3 | `dev.ps1`, the desktop shortcuts, ports, and Orion's port 3000. |

### 5.4 UI track and orientation

| Skill | Pri | What it does and why |
| --- | --- | --- |
| `textclone-ui-guardrails` | P1 | The UI track rules and the checker. |
| `textclone-ui-parity` | P1 | The new UI sends exactly the requests the old one did. |
| `textclone-checkpoint-preview` | P1 | Starts the preview on 8010/3010 for a UI checkpoint. |
| `textclone-dictation` | P2 | Voice-to-text: local model, permissions, states. |
| `textclone-codebase-map` | P1 | Where everything lives and what calls what. |
| `textclone-voice-glossary` | P2 | The project's own vocabulary: register, target, band, stage, best-so-far, tell. |

## 6. Orion pack

| Skill | Pri | What it does and why |
| --- | --- | --- |
| `orion-orb-integration` | P1 | Renamed from `orb-integration` to fit the naming rule. One engine, vendored into each project, checked against hashes, with a re-sync procedure. |
| `orion-orb-states` **New** | P2 | Maps app states to what the orb shows, with a reduced-motion version and a frame-time budget. |

The rest of the Orion pack will be scoped from the Orion repo itself, not guessed.

## 7. Totals

| Group | From first list | New | Total |
| --- | --- | --- | --- |
| Foundation | 2 | 5 | 7 |
| Shared core (3.1–3.8) | 23 | 45 | 68 |
| Flows | 0 | 5 | 5 |
| Textclone pack | 20 | 15 | 35 |
| Orion pack | 1 | 1 | 2 |
| **All** | **46** | **71** | **117** |

The first list had 45 skills plus #0 `core-project-profile`.

P1 count: 58. The first build batch is the foundation P1s, so every later skill is written and
tested the same way. Then the core P1s, the five flows, and the Textclone voice-quality P1s.
