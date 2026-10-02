# Prompts: 3.2 Product thinking

These skills run before code. They decide whether the right thing gets built. Batch name:
`core-product`. Paste one block per message.

Shared sources for this group (the skills generalise from these and cite them as examples):
textclone README.md (product intent), docs/roadmap/README.md and docs/roadmap/09-new-capabilities/PLAN.md
(feature ideas with "done when" criteria), docs/ui-redesign/PLAN-UI.md §1–2 (a plan that separates
design from function).

---

## `core-product-brief` · P1

```text
Build the skill core-product-brief. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when a new feature or change is requested and nobody has written who it is for, what problem it solves and how success is measured. Not for splitting work into slices (use `core-scope-slicer`). Runs only when invoked by name. Writes .agents/runs/core-product-brief/.

Purpose: one page that stops Muse building what was literally asked instead of what was needed.

Read first: the shared sources above; textclone docs/roadmap/09-new-capabilities/PLAN.md step 1
(multiple variants) as the worked example.

The brief template (references/brief-template.md), max 1 page:
User and situation | Job to be done ("when …, I want …, so I can …") | Problem today (evidence:
a file, a measurement, a user quote) | Success measure (one number, with how it's measured and the
target) | Non-goals (at least 3) | Constraints (from the project rules: local-only, privacy,
budgets) | Risks (top 3) | Open questions.

Steps:
1. Restate the request in one sentence; list what is assumed.
2. Find evidence for the problem in the repo (roadmap, handoff, errors, measurements).
3. Fill the template; mark every unknown "open question" instead of inventing.
4. Check against project constraints (paths.rules); flag conflicts.
5. Ask the open questions that change the design one at a time, recommended answer first; save
   answers to .agents/state/core-product-brief.json and end each turn with
   "Re-invoke: /core-product-brief continue". Write only settled answers into the brief.
Decision rules: no success measure → the brief is not done; a request that conflicts with a
project rule → surface it before anything else; if the request is a bug fix → use
core-flow-bugfix instead.
Anti-patterns: briefs that restate the solution as the problem; success = "it works"; skipping
non-goals.
Evidence: the brief, sources for each "problem" line, the questions asked.
references/: references/brief-template.md, references/example-variants.md (a full brief for
textclone "multiple variants", synthetic numbers labelled as placeholders to be measured).

Evals:
T: "I want to add email mode to textclone" | "let's build a batch feature" | "what should this new
feature actually do?" | "before we code the variants idea, define it" | "I have an idea for a
tone slider"
N: "break the variants feature into steps" → core-scope-slicer | "fix the crash in the loop" →
core-flow-bugfix | "write test cases for the brief" → core-acceptance-criteria

Trial: write a brief for textclone roadmap 09 step 2 (follow-up refinements) from the repo only;
grade whether every problem line cites a source.

Refine signals: features later reworked because the brief missed the real need.
```

---

## `core-acceptance-criteria` · P1

```text
Build the skill core-acceptance-criteria. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when a brief or task needs testable acceptance criteria: given/when/then cases covering the happy path, errors, limits and states. Not for writing the test code (use `core-test-first`). Runs only when invoked by name. Writes .agents/runs/core-acceptance-criteria/.

Purpose: "done" is defined before code, in statements a test can check.

Read first: core-product-brief; textclone tasks.md (any task's "post-check" and regression test
fields, as the house style); docs/AI_WORKFLOW.md "Diagnose and fix" step 5 (cover the failure path).

Steps:
1. For each success measure and requirement, write given/when/then cases.
2. Add cases for: errors (with the project's error codes), empty input, maximum size,
   cancellation, offline or model unavailable, and both themes for UI.
3. Mark each case: unit, API, browser, or manual.
4. Map each case to the test file it will live in.
5. Review for gaps: every requirement has a case; every case is checkable.
Decision rules: "should be fast" → a number with a measuring method; a case that needs live
models or personal data → mark it manual and say why; never more than ~12 cases per slice
(split instead).
Anti-patterns: cases that test implementation details; only happy paths; vague verbs ("handles").
Evidence: the case table with type and target test file.
references/: references/case-patterns.md (patterns for errors, limits, cancellation, partial
results, unverified checks).

Evals:
T: "what exactly counts as done for this feature?" | "write acceptance criteria for email mode" |
"turn the brief into test cases" | "define the given-when-then for cancel" | "how will we know the
variants feature works?"
N: "write the failing test now" → core-test-first | "plan the feature" → core-product-brief |
"check the phase is done" → core-phase-gate

Trial: write the criteria for textclone "continue writing" (roadmap 09 step 3); confirm there is
a case for tense/person continuity and one for an unavailable model.

Refine signals: bugs found later that no criterion covered.
```

---

## `core-scope-slicer` · P1

```text
Build the skill core-scope-slicer. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when a feature is too big for one task: cut it into thin end-to-end slices that each ship alone, riskiest first, with done-when per slice. Not for defining the feature (use `core-product-brief`) or writing task files (use `core-task-authoring`). Runs only when invoked by name. Writes .agents/runs/core-scope-slicer/.

Purpose: small, shippable steps that reveal risk early.

Read first: textclone docs/roadmap/README.md ("every step is sized to be independently
shippable"), docs/roadmap/09-new-capabilities/PLAN.md "Pattern for every new task".

Steps:
1. List the layers the feature crosses (UI, API, engine, storage, tests).
2. Cut vertical slices: each one goes through every layer it needs and produces something usable
   or testable.
3. Rank by risk (unknown tech, data, contracts) and put the riskiest first.
4. For each slice: goal, files, done-when, checks, and what it unblocks.
5. Check each slice fits one session (about ≤ 300 changed lines; otherwise split).
Decision rules: a slice that only builds plumbing with no visible or testable result → merge it
into the next slice; schema changes go in their own slice with a migration rehearsal; UI slices
end at a preview the user can check.
Anti-patterns: horizontal slices ("all the backend first"); easy-first ordering; slices with
shared hidden dependencies.
Evidence: the slice table and the risk ranking with reasons.

Evals:
T: "this feature is huge, how do we break it up?" | "split email mode into steps we can ship" |
"what's the first piece to build?" | "plan the order of work for batch mode" | "make this
manageable in small chunks"
N: "write the tasks.md entries" → core-task-authoring | "define the feature" →
core-product-brief | "estimate how long" → none

Trial: slice textclone roadmap 09 step 8 (batch mode) and justify the first slice by risk.

Refine signals: slices that grew past one session; late surprises a riskier-first order would
have caught.
```

---

## `core-premortem` · P2

```text
Build the skill core-premortem. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use before building something risky: imagine it has already failed, list the most likely causes, and turn each into a guard, test or decision. Not for reviewing finished code (use `core-diff-self-review`). Runs only when invoked by name. Writes .agents/runs/core-premortem/.

Purpose: find failure modes while they are still cheap.

Read first: textclone plan.md §3 and §4 (real blockers and gaps, as examples of failure causes);
docs/roadmap/README.md "Biggest problems".

Steps:
1. State the plan in 3 lines.
2. "It is 2 weeks later and this failed." List 8–10 causes across: data, contracts, performance,
   UX, environment (Windows, ports, GPU), privacy, process (merge, checkpoints).
3. Score each: likelihood (1–3) × impact (1–3).
4. For the top 5: a guard (test, check, design change, or decision) and where it goes.
5. Add the guards to the slices and acceptance criteria.
Decision rules: a cause with impact 3 always gets a guard, regardless of likelihood; causes
without any guard are written as accepted risks.
Anti-patterns: generic causes ("bugs"); guards that are just "be careful".
Evidence: the scored table and where each guard landed.

Evals:
T: "what could go wrong with this migration plan?" | "before we start the fine-tune feature, do a
premortem" | "stress-test this plan" | "imagine this launch failed — why?" | "find the risks in
the dictation design"
N: "review my diff" → core-diff-self-review | "do a security review" → core-security-review |
"write the brief" → core-product-brief

Trial: premortem textclone's UI redesign phase UI-4 (dictation) from docs/ui-redesign/; check
every top-5 cause has a concrete guard.

Refine signals: failures that happened but were not on the list.
```

---

## `core-decision-record` · P2

```text
Build the skill core-decision-record. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when a significant choice is made or reopened (architecture, library, data format, UX rule): record context, options, decision and revisit trigger. Not for task status (use `core-handoff-writer`). Runs only when invoked by name. Writes .agents/runs/core-decision-record/.

Purpose: settled decisions stay settled, and anyone can see why.

Read first: textclone docs/ui-redesign/PLAN-UI.md decisions UD-1…UD-10 (the existing style),
plan.md decisions if any.

Steps:
1. Check for an existing decision on the topic (grep the project's decisions list); if one
   exists, this is a revisit.
2. Write: ID, date, status (proposed/accepted/superseded), context, options (2–4, each with
   costs), decision, consequences, revisit trigger.
3. Put it where the project keeps decisions (a decisions file or the plan's decision list).
4. Link it from the code or doc it governs.
Decision rules: decisions are superseded, never edited away; "proposed" until the user accepts;
a revisit needs new evidence that meets the revisit trigger.
Anti-patterns: records written after the fact with only the winning option; no revisit trigger.
Evidence: the record and its link.
references/: references/template.md.

Evals:
T: "record why we chose sqlite-vec" | "we decided to keep one theme toggle; write that down" |
"document this architecture choice" | "someone wants to reopen the orb decision" | "why did we
pick Atkinson Hyperlegible? make a record"
N: "update the handoff" → core-handoff-writer | "write the feature brief" → core-product-brief |
"add a comment to this function" → none

Trial: write the record for "UI talks to the backend only through lib/api.ts and lib/sse.ts" from
textclone's UI docs, and link it.

Refine signals: the same debate reappearing without new evidence.
```

---

## `core-user-journey-walk` · P1

```text
Build the skill core-user-journey-walk. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use after building a user-facing change: walk the real flow end to end in the running app as the user would, logging friction, dead ends and confusing states. Not for automated layout checks (use `core-layout-audit`). Runs only when invoked by name. Writes .agents/runs/core-user-journey-walk/.

Purpose: catch the problems unit tests can't see.

Read first: textclone docs/ui-redesign/UI-SPEC.md (pages, states), tasks.md §G8 checklists (a
human walk, written down), docs/ui-redesign/guardrails/layout/mock-api.mjs (a safe backend for
walks).

Steps:
1. Start the app on owned ports only, against a mock or a copy of the data (never live).
2. Write the journey: start state → goal (e.g. "paste text, rewrite, copy the result").
3. Walk it with Playwright or by hand; screenshot each step at phone and laptop widths, both themes.
4. Log every friction point: step, what happened, what was expected, severity (blocker / annoying
   / polish).
5. Repeat for the error path (model unavailable) and the empty state.
6. File the blockers and annoyances as tasks.
Decision rules: a step that needs a guess about what to do next is friction; any console error
is at least "annoying"; never use real personal text.
Anti-patterns: walking only the happy path; walking in dev mode only; logging opinions without
the step.
Evidence: the journey, screenshots, the friction log.

Evals:
T: "try the new studio as a user would" | "walk through rewriting a paragraph and tell me what's
awkward" | "use the app end to end and find friction" | "does the flow actually make sense?" |
"click through the whole dictation flow"
N: "run the layout audit" → core-layout-audit | "check keyboard access" → core-a11y-review |
"write browser tests" → core-web-test

Trial: walk textclone's current Studio against the mock API on the UI-track ports; log at least
the friction on the error path.

Refine signals: friction the user found that the walk missed.
```

---

## `core-dogfood` · P3

```text
Build the skill core-dogfood. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use for a timed session using the product on a realistic task with synthetic data, to produce a ranked friction backlog. Not for checking one new change (use `core-user-journey-walk`). Runs only when invoked by name. Writes .agents/runs/core-dogfood/.

Purpose: a broad usability sweep, done regularly.

Read first: core-user-journey-walk; textclone README.md feature list.

Steps:
1. Pick a realistic goal that crosses several features (e.g. "import samples, build profile,
   rewrite three texts, analyse one").
2. Prepare synthetic data in a temp data directory.
3. Use the product for a fixed 20 minutes; log friction as you go (time, place, issue).
4. Rank by frequency × severity; group duplicates.
5. File the top 5 as tasks with briefs.
Decision rules: never stop to fix during the session; synthetic data only.
Anti-patterns: dogfooding the same path every time; fixing during the session.
Evidence: the log, the ranked list, the tasks filed.

Evals:
T: "use the app for a while and tell me what's annoying" | "do a dogfooding session" | "spend 20
minutes as a user and list problems" | "find our biggest usability issues" | "try the whole product
on a realistic task"
N: "walk the new dictation change" → core-user-journey-walk | "review this page against
heuristics" → core-ux-heuristics | "write onboarding" → core-onboarding

Trial: a 20-minute session on textclone with the mock API and synthetic samples.

Refine signals: repeated findings across sessions not acted on.
```
