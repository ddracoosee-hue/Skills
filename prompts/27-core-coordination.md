# Prompts: 3.8 Coordination and research

Batch name: `core-coord`. Paste one block per message.

---

## `core-codex-handoff` · P1

```text
Build the skill core-codex-handoff. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when handing work to Codex (or another agent) for review or fixes: intended behaviour, commit or diff, files, checks run, uncertainties, and exactly where to look. Not for the general handoff log (use `core-handoff-writer`).

Purpose: a reviewer with no access to this conversation can review well.

Read first: textclone CLAUDE.md "Before a Codex review, record…", AGENTS.md roles and "Working
with another assistant", docs/ui-redesign/CODEX-AUDIT.md (a full example), MUSE-PROMPTS.md (the
Codex audit prompt).

Steps:
1. Identify the commit range or describe the uncommitted diff precisely.
2. Write: intended behaviour; changed files; commands run with exact results; known
   uncertainties; specific areas to inspect (file:line, with the question to answer).
3. Separate completed changes from proposals.
4. Write the ready-to-paste prompt for Codex: what to review, the evidence standard (severity,
   file:line, trigger, impact, evidence, fix), review-only vs fix.
5. Put the section in the handoff; give the user the prompt.
Decision rules: never assume the reviewer has seen the chat or private memory; never claim the
reviewer has read or approved anything.
Anti-patterns: "please review my changes" with no focus; omitting failed checks.
Evidence: the handoff section and the Codex prompt.

Evals:
T: "get Codex to review this" | "prepare the audit for codex" | "hand this bug to codex to fix" |
"write what codex needs to check the dictation work" | "set up a second review"
N: "update the handoff log" → core-handoff-writer | "review my own diff" → core-diff-self-review
| "report to me" → core-report-writer

Trial: write the Codex handoff for a synthetic 3-file change with one failed check.

Refine signals: Codex asking for context the handoff should have had.
```

---

## `core-roadmap-sync` · P2

```text
Build the skill core-roadmap-sync. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when work lands that a roadmap or plan tracks: tick the right steps with date and task id, and check plan files still match the code. Not for writing new tasks (use `core-task-authoring`).

Purpose: plans stay true.

Read first: textclone docs/roadmap/README.md (tick format, "one step per session"), tasks.md G5
(tick format "- [x] … (Muse P1.1, YYYY-MM-DD)"), examples of ticked steps in 01 and 04 PLAN.md.

Steps:
1. Map the merged work to roadmap steps (by task refs in commit messages).
2. Tick only steps whose "done when" is met, in the format above.
3. For partly done steps, add a dated sub-note instead of a tick.
4. Find drift: steps that describe code that has changed; report them.
Decision rules: tick on the branch where the work landed; never tick for unmerged work.
Anti-patterns: ticking from memory; rewriting plan text silently.
Evidence: steps ticked with refs; drift list.

Evals:
T: "tick the roadmap steps for what merged" | "is the roadmap up to date?" | "mark P1.5 done in the
plan" | "which plan steps are finished now?" | "sync the plan with the code"
N: "write new tasks for email mode" → core-task-authoring | "update the handoff" →
core-handoff-writer | "make a new roadmap" → core-scope-slicer

Trial: on a copy of a roadmap PLAN.md and a synthetic commit list, tick correctly and find one
drift.

Refine signals: wrong ticks found later.
```

---

## `core-task-authoring` · P2

```text
Build the skill core-task-authoring. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when writing executable tasks for an agent (Muse or Codex): target files, pre-check, regression test, steps, post-check, done-when, stop conditions. Not for slicing a feature (use `core-scope-slicer`).

Purpose: tasks precise enough that an autonomous agent can't misread them.

Read first: textclone tasks.md (Phase 1 tasks as the house style: Target Files, pre-check,
regression test, post-check, refs), docs/ui-redesign/TASKS-UI.md (UI tasks with checker rules).

Steps:
1. One task per slice; id, title, priority, refs.
2. Target files (exact paths, verified to exist); out-of-scope files named.
3. Pre-check: a command whose output proves the gap still exists.
4. Regression test: name, location, the failure it must show first.
5. Steps: numbered, each verifiable.
6. Post-check and done-when; stop conditions.
Decision rules: any path not verified → don't write it; a task over ~300 changed lines → split;
UI tasks name their checkpoint.
Anti-patterns: "improve X"; tasks without a pre-check.
Evidence: the task text and the path verification.

Evals:
T: "write the tasks for phase 5" | "turn these slices into tasks.md entries" | "make a task Muse
can run for the backup fix" | "spec this bug fix as a task for codex" | "write executable steps
for the eval harness"
N: "break the feature into slices" → core-scope-slicer | "tick finished tasks" →
core-roadmap-sync | "write a skill" → core-skill-authoring

Trial: write one task for textclone roadmap 05 step 1 (convergence fix) in tasks.md style,
verifying every path.

Refine signals: tasks Muse misread or had to improvise.
```

---

## `core-research-sources` · P2

```text
Build the skill core-research-sources. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when a task needs facts from outside the repo (library behaviour, standards, tools): search, prefer primary sources, date them, label confidence, separate fact from inference. Not for reading the project's own docs (use `core-context-budget`).

Purpose: researched facts the user can check.

Read first: the user's preference for confidence tags ([Certain] hard evidence, [Likely] strong
inference, [Guessing] filling gaps) and for accurate, current information.

Steps:
1. Write the exact question.
2. Search; prefer primary sources (official docs, standards, source code) over blogs.
3. For each fact: source URL, publication/update date, and a quote or precise paraphrase.
4. Label each claim [Certain], [Likely] or [Guessing].
5. Note conflicts between sources and which one wins and why.
6. End with a Sources list.
Decision rules: installed docs (e.g. node_modules) beat web pages for version-specific behaviour;
undated sources are [Likely] at best; if most of the answer is [Guessing], say so first.
Anti-patterns: citing without opening; outdated answers presented as current.
Evidence: the labelled claims and sources.

Evals:
T: "find out how muse loads skills" | "what does WCAG say about text spacing?" | "research the
best way to run whisper locally" | "look up ollama's keep_alive behaviour" | "check what the
latest docs say about this API"
N: "read our handoff" → core-session-start | "which next.js API to use" → core-nextjs16 | "write
the brief" → core-product-brief

Trial: research "WCAG 2.2 text spacing requirements" and produce labelled claims with sources.

Refine signals: facts later found wrong.
```
