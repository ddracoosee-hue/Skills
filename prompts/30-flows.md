# Prompts: 4. Flows

Flows are the entry points you call by name. Each one chains core skills in a fixed order. Build a
flow only after every skill in its chain is at least `tested`. Batch name: `flows`.

Every flow SKILL.md has the same extra rule: **a flow never repeats a chained skill's instructions.**
It names the skill, says what that step must hand to the next one, and gives the stage's
"done when". This keeps flows short and stops them drifting from the skills they call.

---

## `core-flow-feature` · P1

```text
Build the skill core-flow-feature. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring. Every chained skill must exist and be "tested" or better;
if one is not, stop and list which.

Description (verbatim; change only if R2 fails):
Use when building a new feature end to end: brief, criteria, slices, test-first build, self-review, journey walk, handoff. Not for bug fixes (use `core-flow-bugfix`) or purely visual UI changes (use `core-flow-ui-change`).

Chain and hand-offs (each step is "use <skill>; hand on <output>; done when <condition>"):
1. core-session-start → scope statement.
2. core-product-brief → the brief (success measure filled).
3. core-acceptance-criteria → the case table.
4. core-scope-slicer → slices, riskiest first. For each slice repeat 5–9:
5. core-worktree (once per phase) → a verified worktree.
6. core-test-first → failing test seen.
7. Build the slice; core-recheck-loop → N consecutive passes.
8. core-diff-self-review → findings fixed.
9. core-commit → the commit.
10. core-user-journey-walk (user-facing slices) → friction log; blockers fixed.
11. core-phase-gate (when the phase's slices are done) → gate passed.
12. core-handoff-writer + core-report-writer → handoff section and report.
Decision rules: a failed step returns to its own skill; the flow never skips a step silently —
a skipped step is written with its reason; user checkpoints stop the flow.
Anti-patterns: starting at step 6; merging slices to save time.
Evidence: a flow ledger (references/ledger.md): step, skill, output path or id, done-when met.

Evals:
T: "build email mode" | "let's implement the variants feature properly" | "add batch processing to
textclone from scratch" | "take this feature idea all the way to done" | "build the tone slider
end to end"
N: "fix the crash in upload" → core-flow-bugfix | "restyle the settings page" →
core-flow-ui-change | "try a new prompt and see if it helps" → core-flow-experiment

Trial: run steps 1–4 only on textclone roadmap 09 step 1 (multiple variants) and produce the
ledger; stop before code.

Refine signals: features that needed rework after the flow said done.
```

---

## `core-flow-bugfix` · P1

```text
Build the skill core-flow-bugfix. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring. Chained skills must be "tested" or better.

Description (verbatim; change only if R2 fails):
Use when something is broken and needs fixing: reproduce, find the cause, regression test first, minimal fix, recheck, handoff. Not for new features (use `core-flow-feature`) or test flakiness only (use `core-flake-triage`).

Chain and hand-offs:
1. core-session-start → scope.
2. core-flake-triage (if the failure is intermittent or outside the change) → classification.
3. core-debug-method → reproduction + cause with file:line.
4. core-git-bisect (only if "it used to work") → first bad commit.
5. core-test-first → regression test failing for the stated reason.
6. Minimal fix; core-recheck-loop → N passes.
7. core-diff-self-review → clean.
8. core-commit → commit with the regression line.
9. core-handoff-writer (and core-codex-handoff when Codex reviews) → record.
Decision rules: no fix without a reproduction (or a recorded reason why none is possible); fix
the cause, not the symptom; if the cause is in a protected area (prompts, schema) → stop
condition.
Anti-patterns: fixing before reproducing; broad try/except as a fix.
Evidence: the ledger with the reproduction, cause, test id and commit.

Evals:
T: "the profile build crashes on emoji" | "fix the bug where cancel doesn't stop the job" | "jobs
show running forever, fix it" | "upload fails with a 500" | "there's a regression in scoring,
sort it out"
N: "add a new feature" → core-flow-feature | "this test fails sometimes" → core-flake-triage |
"is the new prompt better?" → core-flow-experiment

Trial: run the flow on a synthetic bug in a trial repo (a function crashing on empty input).

Refine signals: reopened bugs.
```

---

## `core-flow-ui-change` · P1

```text
Build the skill core-flow-ui-change. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring. Chained skills must be "tested".

Description (verbatim; change only if R2 fails):
Use when changing what a UI looks like or how it is arranged without changing what the app does: placement, states, wording, look, then audits and rubric. Not for features with new backend behaviour (use `core-flow-feature`).

Chain and hand-offs:
1. core-session-start → scope, including the project's UI rules (textclone: UI track rules
   U1–U8 and GUARDRAILS, via textclone-ui-guardrails).
2. core-information-architecture → one-home table.
3. core-states-design → state matrix.
4. core-microcopy → strings.
5. core-nextjs16 → doc facts for the APIs used.
6. Build with tokens only (core-visual-design-method rules).
7. core-layout-audit (quick) → clean; core-a11y-review → clean.
8. Functional parity check (textclone: textclone-ui-parity) → identical requests.
9. core-visual-design-method rubric → score with evidence.
10. Checkpoint preview if the project requires one (textclone-checkpoint-preview) → stop for
    approval.
11. core-commit, core-handoff-writer.
Decision rules: any change in requests or defaults → it's not a UI change; stop and use
core-flow-feature; audit findings are fixed in the UI, never in the audit.
Anti-patterns: raw colours; skipping both themes; testing only at laptop width.
Evidence: the ledger with audit summaries, rubric score, parity result.

Evals:
T: "redesign the settings page" | "move the presets into a drawer" | "make the analyze page match
the new look" | "restyle the samples list" | "tidy up the console layout"
N: "add a new export feature" → core-flow-feature | "the copy button crashes" → core-flow-bugfix
| "check overflow only" → core-layout-audit

Trial: run steps 1–4 for textclone's Settings page restyle (UI-8 scope) and stop before code.

Refine signals: UI changes that broke behaviour or failed checkpoints.
```

---

## `core-flow-experiment` · P1

```text
Build the skill core-flow-experiment. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring. Chained skills must be "tested".

Description (verbatim; change only if R2 fails):
Use when trying an idea to improve output quality or speed (prompt, model, setting, retrieval, metric): log, baseline, change one thing, measure, check stats, keep or revert. Not for building features (use `core-flow-feature`).

Chain and hand-offs:
1. core-experiment-log → hypothesis entry; duplicate check done.
2. core-llm-eval → baseline run id (or core-perf-profiling / core-latency-budget for speed).
3. Make one change on a branch (core-prompt-versioning if a prompt changes).
4. core-llm-eval → comparison run id.
5. core-stats-sanity → verdict with n and CI.
6. Keep (core-commit) or revert; core-experiment-log → result entry.
Decision rules: one variable per experiment; GPU runs need the user's go-ahead; "no significant
change" → revert.
Anti-patterns: changing two things; keeping changes on vibes.
Evidence: the ledger with run ids, verdict and keep/revert.

Evals:
T: "try a lower temperature and see if voice improves" | "does mistral-nemo beat qwen3 for us?" |
"experiment with exemplar count" | "test whether the new soft length rule helps" | "see if
retrieval weights matter"
N: "build a feature" → core-flow-feature | "fix the convergence bug" → core-flow-bugfix | "blind
test my voice" → textclone-blind-voice-test

Trial: run the flow on a synthetic scoring function (no LLM) in a trial folder, end to end.

Refine signals: kept changes that later regressed.
```

---

## `core-flow-release` · P3

```text
Build the skill core-flow-release. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring. Chained skills must be "tested".

Description (verbatim; change only if R2 fails):
Use when preparing a release end to end: backup drill, migration rehearsal, green CI, version and notes, smoke test. Not for only writing release notes (use `core-release`).

Chain and hand-offs:
1. core-session-start → scope (version target).
2. core-backup-drill → pass.
3. core-migration-rehearsal (if the schema changed since the last release) → pass.
4. core-ci-setup or core-recheck-loop on master → green.
5. core-release → version, notes, tag, smoke test.
6. core-report-writer → release report.
Decision rules: any failed step stops the release; pushing tags is the user's action.
Anti-patterns: releasing with a pending checkpoint.
Evidence: the ledger.

Evals:
T: "ship version 0.2 properly" | "do a full release" | "get textclone ready to release" | "run the
whole release checklist" | "release with all the safety checks"
N: "write the changelog" → core-release | "test backups" → core-backup-drill | "set up CI" →
core-ci-setup

Trial: dry-run the flow on a trial repo with a synthetic database.

Refine signals: release incidents.
```
