# Prompts: 5.3 Textclone contracts, data and operations

Batch name: `textclone-contracts`. Paste one block per message.

---

## `textclone-error-contract` · P1

```text
Build the skill textclone-error-contract. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when raising, mapping or displaying a Textclone error: TextcloneError subclasses with code, hint, retryability, exit code and request id, kept identical across API, CLI and UI. Not for general API design (use `core-api-design`).

Read first: textclone/errors.py (TextcloneError; ConfigError CFG_INVALID_001 exit 2; DependencyError
DEP_MISSING_001 exit 3; IngestError ING_* exit 1; LLMError LLM_* exit 4 including
LLM_OLLAMA_DOWN_001, LLM_TIMEOUT_002, LLM_MODEL_MISSING_003, LLM_MALFORMED_004; and the rest of
the file), textclone/api/middleware.py (RFC 7807), README exit codes (0 ok, 1 generic, 2 config,
3 dependency, 4 LLM, 5 resource, 6 partial), web/lib/api.ts, textclone/cli/render.py, tasks.md G3
item 8.

Steps:
1. references/codes.md: every class, code, exit code, retryable, default hint — generated from
   errors.py (re-generate when it changes).
2. Raising: pick the most specific subclass; write a hint that names the next action.
3. API: problem+json with code, hint, retryable, request id; CLI: exit code and rendered hint; UI:
   shows hint and retry when retryable.
4. Tests: one per new code across API and CLI.
Decision rules: never bare Exception; never blanket-catch to hide failures (boundary catches are
deliberate and documented); codes are never reused or renamed.
Anti-patterns: string-matching messages in the UI; new codes without hints.
Evidence: the codes table, tests.

Evals:
T: "what error should ingest raise for a bad encoding?" | "add an error code for a full disk" |
"the UI doesn't show the hint" | "make the CLI exit code right for model missing" | "map this
exception to our error system"
N: "design a new endpoint" → core-api-design | "word the message nicely" → core-microcopy | "SSE
error event" → textclone-sse-contract

Trial: generate references/codes.md from errors.py and check it against README exit codes.

Refine signals: errors reaching the user without a hint.
```

---

## `textclone-sse-contract` · P1

```text
Build the skill textclone-sse-contract. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when changing Textclone streaming: event kinds and order, payloads, heartbeats, terminal events, reconnects and how web/lib/sse.ts consumes them. Not for job state design (use `core-state-machines`).

Read first: textclone/api/sse.py (event(), error_event(), done kinds), api/routes/generate.py,
api/routes/jobs.py, web/lib/sse.ts (listens for status, progress, log, done, error, end, stage,
draft, check, critique, repair, final; terminal on done/error), web/lib/sse.test.mjs,
tests/unit/test_generation_stream.py, the UI-track event list in docs/ui-redesign/UI-SPEC.md.

Steps:
1. references/events.md: every event the server emits (from code), payload fields, order, and
   whether the client listens for it. Flag mismatches both ways.
2. For a change: additive events only; terminal semantics unchanged (exactly one terminal event).
3. Tests on both sides (pytest stream test; node --test for sse.ts).
Decision rules: the client must stop reconnecting after a terminal event; cancelled runs end
cleanly; payloads never carry corpus text beyond the result itself.
Anti-patterns: emitting events the client silently ignores; two terminal events.
Evidence: the events table with mismatches, tests.

Evals:
T: "add a progress event for retrieval" | "the client keeps reconnecting after done" | "which
events does the server send?" | "the UI ignores the warning event" | "change the final payload"
N: "jobs stuck running" → core-state-machines | "error codes" → textclone-error-contract | "API
request shapes" → textclone-api-contract

Trial: build the events table from sse.py/routes and sse.ts; list mismatches.

Refine signals: stream bugs.
```

---

## `textclone-api-contract` · P1

```text
Build the skill textclone-api-contract. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when Textclone API request or response shapes change or need verifying: snapshot the OpenAPI schema, contract tests, and the UI's request parity. Not for designing new endpoints (use `core-api-design`).

Read first: textclone/api/app.py, routes/*.py, docs/roadmap/12-testing-ci/PLAN.md step 6 (contract
tests from OpenAPI), docs/ui-redesign/guardrails/request-parity.json (13 golden request cases) and
check-ui.mjs G8/G9, web/lib/api.ts, tests/unit/test_api*.py.

Steps:
1. Snapshot the OpenAPI schema from the app (TestClient, no live server).
2. Diff against the last snapshot; classify changes as additive or breaking.
3. Breaking → stop and ask; additive → update snapshot and tests.
4. Check the UI's requests still match request-parity.json cases.
Decision rules: the UI track may not add API paths except GET /api/compose/registry; snapshots
live in tests, not docs.
Anti-patterns: updating snapshots without reading the diff.
Evidence: the schema diff and classification.

Evals:
T: "did this change break the API?" | "snapshot the openapi schema" | "add contract tests" | "the
UI sends a different body now" | "check request parity"
N: "design the new endpoint" → core-api-design | "SSE events" → textclone-sse-contract | "UI
track rules" → textclone-ui-guardrails

Trial: generate a schema snapshot in a worktree with TestClient and list all paths.

Refine signals: breaking changes that slipped through.
```

---

## `textclone-db-migration` · P1

```text
Build the skill textclone-db-migration. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring. Build after core-migration-rehearsal.

Description (verbatim; change only if R2 fails):
Use when writing a Textclone schema migration: a new db/schema/vNNN.sql, PRAGMA user_version, compatibility with existing data, first-connect race, backup first. Not for the rehearsal method alone (use `core-migration-rehearsal`).

Read first: textclone/db/connection.py, db/schema/v001.sql, db/backup.py, db/integrity.py,
plan.md §2 invariant 6 and B-3, tasks.md G7 (a migration not in the task is a stop condition),
docs/roadmap/01-data-integrity/PLAN.md, tests/unit/test_db.py.

Steps:
1. Confirm the task specifies the migration (else stop).
2. Write vNNN.sql: additive, idempotent where possible; data backfill explicit.
3. Ensure the runner applies it under a lock (first-connect race) and backs up first.
4. Tests: fresh DB, v(N-1) DB with synthetic rows, concurrent first connect.
5. Rehearse with core-migration-rehearsal.
Decision rules: never drop or rename columns with data without a user-approved plan; never run
against the live DB.
Anti-patterns: editing an old vNNN.sql; migrations without tests.
Evidence: the SQL, tests, rehearsal table.

Evals:
T: "add an eval_runs table" | "add a provenance column to samples" | "write the v002 migration" |
"migration fails on first start sometimes" | "change the schema for multi-profile"
N: "rehearse a migration" → core-migration-rehearsal | "backups" → core-backup-drill | "API
shape" → textclone-api-contract

Trial: write a trial v00X adding a nullable column, with tests on a synthetic v001 DB (trial
branch, no merge).

Refine signals: migration bugs.
```

---

## `textclone-ingest-pipeline` · P2

```text
Build the skill textclone-ingest-pipeline. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when changing Textclone's shared ingest stages: cleaning, segmentation, dedup, role classification, quality scoring, quarantine and corpus health. Not for one source format (use `textclone-ingest-adapter`).

Read first: textclone/ingest/pipeline.py, cleaning.py, segment.py, dedup.py (LSH),
classify_role.py, quality.py, paste.py; textclone/db/repo_corpus.py; docs/roadmap/03-corpus-ingestion/PLAN.md steps
2–5, 7–9, 11; tests/unit/test_ingest.py, test_api_corpus.py.

Steps:
1. Map stages and their inputs/outputs with file:line (references/pipeline-map.md).
2. For a change: which stage, what invariant (no lost samples, role changes don't destroy chat
   samples, within-batch near-duplicates caught).
3. Tests with fixtures; counts before/after.
Decision rules: quarantine one record, never a whole file; reviewed/high-confidence samples feed
the profile (03 step 4).
Anti-patterns: per-format hacks in shared stages.
Evidence: the map, tests.

Evals:
T: "near duplicates in one upload aren't caught" | "change the quality threshold" | "role changes
delete chat samples" | "how does segmentation work?" | "add a corpus health summary"
N: "new telegram importer" → textclone-ingest-adapter | "collect more data" →
textclone-corpus-growth | "provenance labels" → textclone-provenance

Trial: build the pipeline map.

Refine signals: ingest data loss.
```

---

## `textclone-profile-feature` · P2

```text
Build the skill textclone-profile-feature. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when adding a profile-level capability end to end in Textclone (builder stage, stored field, API, UI display, rebuild trigger). Not for a single style metric (use `textclone-stylometry-metric`) or registers (use `textclone-registers`).

Read first: textclone/profile/builder.py, aggregate.py, style_card.py, api/routes/profile.py,
web/app/profile, resources/jobs.py (profile build job), tests/unit/test_profile.py.

Steps:
1. Where the capability is computed in the builder; job progress events.
2. Storage (migration via textclone-db-migration if needed).
3. API exposure (core-api-design), UI display (UI rules).
4. Rebuild triggers and staleness.
5. Tests end to end with synthetic corpus.
Decision rules: profile builds are jobs (cancellable, resumable).
Anti-patterns: computing profile data on request.
Evidence: the end-to-end path and tests.

Evals:
T: "show greeting habits on the profile page" | "add recency weighting to the profile" | "store
per-register openers" | "profile rebuild should trigger when samples change" | "expose the voice
card via the API"
N: "add a metric" → textclone-stylometry-metric | "register logic" → textclone-registers | "card
claims evidence" → textclone-registers

Trial: trace an existing profile field from builder to UI with file:line.

Refine signals: stale profile data.
```

---

## `textclone-synthetic-fixtures` · P1

```text
Build the skill textclone-synthetic-fixtures. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when a Textclone test, trial or demo needs text or data: build synthetic samples, registers, exports and databases that mimic shape without real writing. Not for general privacy scans (use `core-privacy-guard`).

Read first: tests/conftest.py (TEXTCLONE_DATA_DIR isolation; fails tests that open
data/textclone.db), tests/fixtures/ (existing synthetic files), tests/fault_injection/mock_router.py,
docs/ui-redesign/guardrails/layout/mock-api.mjs (synthetic API data).

Steps:
1. Reuse existing fixtures first.
2. New fixtures: written for the purpose, with clear register differences (e.g. formal vs chatty),
   realistic length spread, edge cases (emoji, quotes, timezones, very long, empty).
3. Generators: deterministic (seeded) Python helpers for many samples.
4. Temp data dir per test; never the real one.
Decision rules: never derive fixtures from the real corpus, even "anonymised"; fixtures are small.
Anti-patterns: lorem ipsum for style tests (no style signal).
Evidence: fixture files and the generator seed.

Evals:
T: "I need fake writing samples for a test" | "make a synthetic corpus with two registers" |
"build a fake whatsapp export with timezone edge cases" | "seed a temp database for the trial" |
"mock data for the profile tests"
N: "is there private data in the commit?" → core-privacy-guard | "write the test" →
core-test-first | "mock the LLM" → none

Trial: generate a seeded synthetic corpus (2 registers × 20 samples) and verify the profile
builder separates them in a temp data dir.

Refine signals: tests that needed real data.
```

---

## `textclone-doctor-check` · P2

```text
Build the skill textclone-doctor-check. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when adding or changing a `textclone doctor` check: ok/warn/fail with detail and hint, and a --fix only when the repair is safe and reversible. Not for first-run UX (use `core-onboarding`).

Read first: textclone/health.py (CheckResult with fixable/fixed; check_python, check_config,
check_api_routers, check_dirs, check_long_paths, check_sqlite_vec, check_database, …),
textclone/cli/main.py doctor (exit 3 on failure), README doctor flags (--fix, --quick, --json).

Steps:
1. Define what is checked, thresholds for warn/fail, and the hint.
2. Decide fixability: safe, reversible, local, no downloads → may fix; otherwise hint only.
3. Implement; respect --quick (skip slow checks) and --json.
4. Tests: ok, warn, fail, fix paths with temp dirs.
Decision rules: --fix never deletes user data and never downloads models.
Anti-patterns: checks without hints; fixes that change config silently.
Evidence: the check table and tests.

Evals:
T: "doctor should warn when the calibration is stale" | "add a check for free disk space" | "make
doctor --fix create the missing folders" | "doctor says ok but ollama is down" | "add a quick
mode check"
N: "first launch experience" → core-onboarding | "health endpoint" → textclone-api-contract |
"repair the database" → core-backup-drill

Trial: implement a trial "free disk space" check with tests in a worktree branch (no merge).

Refine signals: problems doctor missed.
```

---

## `textclone-jobs-recovery` · P2

```text
Build the skill textclone-jobs-recovery. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring. Build after core-crash-recovery.

Description (verbatim; change only if R2 fails):
Use when Textclone jobs need recovering or their recovery changed: jobs list/show/resume, partial results (exit 6), watchdog, GPU lock, and resume after crashes. Not for the generic crash-test method (use `core-crash-recovery`).

Read first: textclone/resources/jobs.py, watchdog.py, vram.py; api/routes/jobs.py;
cli/local_job.py; README jobs commands and exit code 6; tests/unit/test_jobs.py; tasks.md UI-CP2
checklist (cancel shows "cancelled", no reconnect loop).

Steps:
1. Map job kinds and their resume support.
2. For a change: resume from checkpoint, not from zero; partial results labelled; GPU lock
   respected.
3. Crash tests via core-crash-recovery at three kill points.
Decision rules: a resumed job never duplicates rows; cancelled ≠ failed.
Anti-patterns: resume that silently restarts.
Evidence: the job kinds table and crash results.

Evals:
T: "resume the profile build that died" | "jobs list shows a zombie" | "partial result exit code
is wrong" | "make calibration resumable" | "the watchdog killed a healthy job"
N: "generic kill test" → core-crash-recovery | "job state design" → core-state-machines | "SSE
reconnect" → textclone-sse-contract

Trial: map job kinds and resume support from the code.

Refine signals: lost jobs.
```

---

## `textclone-launcher` · P3

```text
Build the skill textclone-launcher. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when changing how Textclone starts and stops: dev.ps1, desktop.ps1, shortcuts, port selection around Orion, reopening an existing instance. Not for generic Windows packaging (use `core-windows-packaging`).

Read first: scripts/dev.ps1 (ApiPort 8000, WebPort 3000 with fallback when taken; reuses an
existing instance; -NoBrowser), desktop.ps1, install-desktop-shortcuts.ps1, setup.ps1;
tests/unit/test_dev_launcher.py; tasks.md G8 (preview with -ApiPort 8010 -WebPort 3010).

Steps:
1. Map start/stop flows and port decisions with line refs.
2. For a change: Orion's 3000 and the user's live instance stay untouched; explicit ports for
   previews.
3. Tests (test_dev_launcher.py) and a manual run on owned ports.
Decision rules: stop scripts only stop this checkout's processes.
Anti-patterns: killing by process name.
Evidence: the flow map, tests.

Evals:
T: "the launcher opened orion instead of textclone" | "start textclone on different ports" |
"stop shortcut doesn't stop the api" | "running dev.ps1 twice starts two copies" | "preview on
8010"
N: "installer" → core-windows-packaging | "is the port free?" → core-port-safety | "checkpoint
preview steps" → textclone-checkpoint-preview

Trial: map dev.ps1's port logic with line refs.

Refine signals: launcher incidents.
```
