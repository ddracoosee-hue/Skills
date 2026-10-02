# Prompts: 3.5 Reliability, environment and release

Batch name: `core-ops`. Paste one block per message.

---

## `core-windows-env` · P1

```text
Build the skill core-windows-env. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when running commands on Windows/PowerShell: npm.cmd, venv paths, quoting, junctions, env vars per block, stopping process trees, path length. Not for port ownership (use `core-port-safety`).

Purpose: commands that work first time on the user's Windows 11 PC.

Read first: textclone tasks.md §G2 and §G8 (PowerShell blocks, junctions, $env:PYTHONPATH per
block, taskkill /T /F), docs/AI_WORKFLOW.md commands (npm.cmd, .\node_modules\.bin\tsc.cmd),
scripts/dev.ps1, scripts/setup.ps1.

Content (references/windows-cheatsheet.md): npm.cmd not npm in non-interactive shells; venv
interpreter path .venv\Scripts\python.exe; $env:X lasts only for that invocation; junctions
(New-Item -ItemType Junction) need no admin, symlinks may; quoting paths with spaces;
Start-Process -PassThru and saving PIDs; taskkill /PID <pid> /T /F to kill trees (browsers, dev
servers); Test-NetConnection / Get-NetTCPConnection for ports; ExecutionPolicy Bypass per
script; CRLF vs LF in git (core.autocrlf), long paths.

Steps:
1. Before a command, check it against the cheatsheet.
2. Write commands with explicit interpreter paths and per-block env vars.
3. After starting processes, record PIDs; on finish, kill trees you started — only those.
4. On an error, check the cheatsheet's "common errors" table before debugging.
Decision rules: never kill processes by name pattern (it can kill the user's apps or your own
shell); never change system-wide settings (execution policy, PATH) without asking.
Anti-patterns: bash syntax in PowerShell; pkill-style broad kills; relying on activated venvs.
Evidence: commands used and their exit codes; PIDs started and stopped.

Evals:
T: "npm isn't recognised in the script" | "the env var didn't stick between commands" | "chromium
keeps running after the audit" | "how do I link the models folder on windows?" | "the powershell
command fails with a quoting error"
N: "is port 3010 free?" → core-port-safety | "set up the worktree" → core-worktree | "install
python" → none

Trial: write and run (in a trial folder) a PowerShell block that starts a dummy server process,
records its PID, and kills its tree; confirm no leftover process.

Refine signals: Windows-specific failures in field logs.
```

---

## `core-port-safety` · P1

```text
Build the skill core-port-safety. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use before starting or stopping any server: use only the project's owned ports, never touch forbidden ones (the user's live apps, Ollama), and free ports only from processes you started. Not for general Windows commands (use `core-windows-env`).

Purpose: never break the user's running Textclone, Orion or Ollama.

Read first: textclone tasks.md §G8 item 5 (never stop 8000/3001, 3000, Ollama); scripts/dev.ps1
(it moves the UI port up when taken); docs/ui-redesign/GUARDRAILS.md (UI-track ports 8799, 3020,
3030, preview 8010/3010); orion README (host :8787).

Steps:
1. Read ports.owned and ports.forbidden from project.json.
2. Before starting: check the port is free (Get-NetTCPConnection); if taken, find the owner.
3. If the owner is a process you started in this session → stop it by PID tree. Otherwise → pick
   another owned port or stop and ask.
4. Start servers only on owned ports; record PID and port in the handoff while running.
5. On finish: stop your processes; confirm the ports are free.
Decision rules: a forbidden port is never stopped, probed with writes, or reused; a launcher that
"moves up" a port may land on a forbidden one → pass explicit ports.
Anti-patterns: killing whatever holds the port; hard-coding ports in core skills.
Evidence: port checks before and after, PIDs.

Evals:
T: "start the preview server for the checkpoint" | "port 3010 is already in use" | "can I run the
mock api now?" | "make sure we don't break the live app while testing" | "clean up the servers
you started"
N: "kill chromium processes" → core-windows-env | "start the checkpoint preview for textclone" →
textclone-checkpoint-preview | "configure ports for orion" → core-project-profile

Trial: occupy an owned port with a dummy process from another shell; the skill must detect it,
recognise it isn't its own, and choose another owned port.

Refine signals: any touch of a forbidden port.
```

---

## `core-privacy-guard` · P1

```text
Build the skill core-privacy-guard. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use before committing, writing handoffs, logs, skills or reports, and when tests need text: keep personal writing, databases, .env, tokens and logs out; use synthetic data. Not for security bugs in code (use `core-security-review`).

Purpose: the user's writing and secrets never leave the machine or enter Git.

Read first: textclone AGENTS.md (keep personal texts, databases, model weights, .env, logs out of
Git and handoffs), tests/conftest.py (fails any test that opens data/textclone.db),
.gitignore, plan.md §2 invariant 2.

Steps:
1. Load paths.private from project.json.
2. Before a commit/handoff/report: scan staged or written content for private paths, .env-style
   lines, tokens (ghp_, sk-, AKIA), emails, and long verbatim text blocks that look like corpus.
3. For tests and examples: use tests/fixtures or synthetic text written for the purpose.
4. When showing data in a report: counts and shapes, never content.
5. If something private was committed: stop, tell the user, don't rewrite history yourself.
Decision rules: when unsure whether text is personal, treat it as personal; reading the live DB
is only allowed via a read-only copy for a user-approved preview, never quoted.
Anti-patterns: "just one example sentence from the corpus"; pasting logs into handoffs.
Evidence: the scan result.
references/: references/patterns.md (regexes and what they catch).

Evals:
T: "is anything private in this commit?" | "I need sample text for a test" | "can I paste the
error log into the handoff?" | "make sure the skill files have no personal data" | "check the
report doesn't leak my writing"
N: "is the upload route secure?" → core-security-review | "write synthetic fixtures for
textclone" → textclone-synthetic-fixtures | "delete my data" → none

Trial: scan a trial folder containing one fake token, one fake email and one clean file; it must
flag exactly two.

Refine signals: any private item found later.
```

---

## `core-backup-drill` · P2

```text
Build the skill core-backup-drill. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use to prove backups work: back up an isolated copy, restore it, compare integrity and counts, and test rotation keeps manual backups. Not for schema migrations (use `core-migration-rehearsal`).

Purpose: a backup that was never restored is unproven.

Read first: textclone textclone/db/backup.py, README CLI (textclone db check|backup|backups|restore),
docs/roadmap/01-data-integrity/PLAN.md step 2 (rotation must keep manual backups), tests/unit/test_db.py.

Steps:
1. Create an isolated data dir with a synthetic database (never the live one).
2. Back up with the project's command; record file and size.
3. Modify the copy; restore; compare integrity check, table row counts and checksums.
4. Rotation: create more backups than the keep count, mixing manual and automatic; confirm only
   automatic ones rotate.
5. Report.
Decision rules: live data is never the drill subject; a restore that changes counts is a failure.
Anti-patterns: checking only that the backup file exists.
Evidence: the before/after comparison table.

Evals:
T: "do our backups actually restore?" | "run a backup drill" | "check rotation keeps my manual
backups" | "prove restore works" | "test the db backup command"
N: "migrate the schema" → core-migration-rehearsal | "the app crashed mid-job" →
core-crash-recovery | "back up my real database" → none

Trial: the full drill with textclone's CLI against TEXTCLONE_DATA_DIR pointing at a temp folder.

Refine signals: backup incidents.
```

---

## `core-migration-rehearsal` · P2

```text
Build the skill core-migration-rehearsal. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use before any database schema change ships: run the migration on a copy, compare counts and integrity, test the old-to-new path and the rollback. Not for writing Textclone's migration code (use `textclone-db-migration`).

Purpose: migrations never surprise existing data.

Read first: textclone textclone/db/connection.py (PRAGMA user_version), textclone/db/schema/,
plan.md §2 invariant 6, plan.md B-3 (first-connect race).

Steps:
1. Build an old-version database with synthetic data (or a user-approved read-only copy).
2. Take a backup (core-backup-drill method).
3. Run the migration on the copy; record version before/after, counts, integrity_check.
4. Run the app's read paths on the migrated copy (tests or CLI checks).
5. Test rollback: restore the backup; old code opens it.
6. Test concurrent first connect (two processes) if the project has had races.
Decision rules: data loss of any row is a blocker; migrations are additive unless the user
approves otherwise.
Anti-patterns: testing only on an empty database.
Evidence: the before/after table and integrity output.

Evals:
T: "rehearse the v002 migration" | "will this schema change break existing databases?" | "test
the migration on a copy" | "check the rollback works" | "migration race on first start"
N: "write the migration sql" → textclone-db-migration | "test the backups" → core-backup-drill |
"design the table" → core-api-design

Trial: rehearse a trivial additive migration (a new nullable column) on a synthetic v001 copy.

Refine signals: migration incidents.
```

---

## `core-crash-recovery` · P2

```text
Build the skill core-crash-recovery. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use to test that long work survives crashes: kill the app mid-job and check resume, best-so-far results, no duplicates and no corruption. Not for job state design (use `core-state-machines`).

Purpose: recoverable jobs that really recover.

Read first: textclone textclone/resources/jobs.py, watchdog.py, README "textclone jobs
list|show|resume", plan.md §2 invariant 7 (best-so-far), tests/fault_injection/.

Steps:
1. Start a long job on owned ports with synthetic data and the mock router.
2. Kill the process tree at 3 points (early, middle, during a write).
3. Restart; list jobs; resume; compare outcome with an uninterrupted run.
4. Check: no duplicate rows, integrity ok, partial result marked partial (exit code 6 where the
   CLI is used), best-so-far kept.
Decision rules: a crash during a write that corrupts data is a blocker; resume that restarts from
zero is a finding.
Anti-patterns: only testing graceful cancel.
Evidence: the kill points and outcome table.

Evals:
T: "what happens if the app crashes during a profile build?" | "kill it mid-generation and see if
it resumes" | "test job recovery" | "does a power cut corrupt anything?" | "check resume after a
crash"
N: "design job states" → core-state-machines | "textclone jobs resume command" →
textclone-jobs-recovery | "backups" → core-backup-drill

Trial: kill a synthetic long-running script that writes checkpoints; verify resume logic (trial
folder).

Refine signals: lost work reported.
```

---

## `core-local-observability` · P3

```text
Build the skill core-local-observability. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when a failure needs a timeline or logging needs improving: structured local logs with request ids, no personal text, and a "what happened" reconstruction. Not for debugging method (use `core-debug-method`).

Purpose: every failure can be explained from local logs.

Read first: textclone textclone/log.py (structlog JSON lines to data/logs/textclone.log, rotated),
textclone/errors.py (request ids), textclone/api/middleware.py, README `textclone errors list|show`.

Steps:
1. For a failure: collect log lines by request id; order by time.
2. Build the timeline: request → stages → error, with durations.
3. Find gaps (stages without log lines); propose log events with fields, never text content.
4. Check logs never include corpus text, prompts with personal text, or secrets.
Decision rules: log ids, counts, durations, codes — not content; local only, no telemetry.
Anti-patterns: logging full prompts; print statements.
Evidence: the timeline and proposed events.

Evals:
T: "reconstruct what happened in that failed request" | "our logs don't show where it hung" |
"add logging to the ingest pipeline" | "trace request id abc through the logs" | "do the logs leak
text?"
N: "debug this bug" → core-debug-method | "privacy scan before commit" → core-privacy-guard |
"send logs to a service" → none

Trial: build a timeline from a synthetic JSON-lines log with two interleaved requests.

Refine signals: failures that couldn't be explained from logs.
```

---

## `core-ci-setup` · P2

```text
Build the skill core-ci-setup. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when setting up or fixing continuous integration: GitHub Actions running the project's fast checks on push without GPUs, models or personal data. Not for local recheck loops (use `core-recheck-loop`).

Purpose: regressions caught automatically.

Read first: textclone docs/roadmap/12-testing-ci/PLAN.md (steps 1–5: markers, pre-commit, Actions,
frontend tests, e2e), pyproject.toml, web/package.json, tests/conftest.py.

Steps:
1. Choose the light checks: ruff, unit tests that need no models (markers), web lint, typecheck,
   build.
2. Write the workflow; cache pip/npm; Windows runner if Windows-specific code is tested.
3. Run locally first with the same commands.
4. Propose the workflow to the user (pushing it is the user's call).
5. When CI fails: reproduce locally, fix the cause.
Decision rules: CI never needs Ollama, GPU, model downloads or the corpus; tests that need models
are marked and skipped in CI, not deleted; secrets never in workflow files.
Anti-patterns: CI that only runs lint; disabling failing tests.
Evidence: the workflow file, a local run of the same commands.

Evals:
T: "set up github actions for textclone" | "CI keeps failing on the web build" | "run tests
automatically on every push" | "add pre-commit checks" | "split tests that need models from light
ones"
N: "run the tests locally 3 times" → core-recheck-loop | "release a version" → core-release |
"fix a flaky test" → core-flake-triage

Trial: draft the workflow for textclone roadmap 12 step 3 in a trial folder and run its commands
locally (no push).

Refine signals: CI misses or noise.
```

---

## `core-release` · P3

```text
Build the skill core-release. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when shipping a version: bump the version, write the changelog and release notes, tag, and smoke-test the built release. Not for packaging installers (use `core-windows-packaging`).

Purpose: releases that are traceable and tested.

Read first: textclone pyproject.toml version, web/package.json version, README run/setup.

Steps:
1. Confirm master is green (CI or recheck) and no checkpoint is pending.
2. Choose the version (semver: breaking/feature/fix).
3. Changelog from merged commits: user-facing changes first, no internals noise.
4. Tag (annotated) locally; pushing is the user's decision.
5. Smoke test: fresh setup from the tag in a temp folder; launch; one core action with the mock.
Decision rules: no release with unverified migrations; versions in all manifests match.
Anti-patterns: tags on unmerged branches; notes copied from commit subjects only.
Evidence: version, changelog, tag, smoke-test output.

Evals:
T: "cut a release" | "write release notes for this version" | "tag v0.2.0" | "what changed since
the last release?" | "prepare textclone 0.2"
N: "build an installer" → core-windows-packaging | "set up CI" → core-ci-setup | "report today's
work" → core-report-writer

Trial: dry-run a release on a trial repo with 5 commits; produce notes and an annotated tag.

Refine signals: release regressions.
```

---

## `core-windows-packaging` · P3

```text
Build the skill core-windows-packaging. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when making the app installable or launchable on Windows: shortcuts, launch scripts, first-run checks, uninstall, tested on a clean user profile. Not for version tagging (use `core-release`).

Purpose: one-click start and stop that works on a fresh machine.

Read first: textclone scripts/setup.ps1, dev.ps1, desktop.ps1, install-desktop-shortcuts.ps1;
README Setup and Run.

Steps:
1. Map install steps and what each downloads or writes.
2. Check shortcuts: start, stop, open; scoped to this checkout; respect other apps' ports.
3. Test on a clean Windows user profile (or a fresh folder with no venv): setup → launch → stop.
4. Document uninstall (what to remove; user data kept unless asked).
Decision rules: never delete user data on uninstall without asking; model downloads need consent.
Anti-patterns: shortcuts pointing at absolute paths of another checkout.
Evidence: the clean-profile run log.

Evals:
T: "make textclone start with one click" | "the desktop shortcut opens the wrong instance" | "how
do I uninstall cleanly?" | "test the setup on a fresh profile" | "package the app for windows"
N: "release version 0.2" → core-release | "first-run experience" → core-onboarding | "launcher
ports for textclone" → textclone-launcher

Trial: review textclone's install-desktop-shortcuts.ps1 against the checklist (review only).

Refine signals: install failures.
```
