# Prompts: 2. Foundation

Build these first, in this order. Every later skill is written with `core-skill-authoring`, tested with
`core-skill-evals`, and reads `core-project-profile`'s schema. Batch name: `foundation`.

Paste one block per message. Each block is complete on its own.

---

## 2.1 `core-skill-authoring` · P1 · build first

```text
Build the skill core-skill-authoring. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (stages R1–R3). This is the first skill, so there are no other skills to
check for overlap yet.

Description (verbatim; change only if R2 fails):
Use when writing a new Muse skill or restructuring one in the skills repo: folder, frontmatter, the eight sections, evals and changelog. Not for trigger tests (use `core-skill-evals`) or revising from field logs (use `core-retro`).

Purpose: turn 00-BUILD-PROTOCOL.md into a skill, so every Muse session writes skills the same way
even when the protocol file is not open.

Read first: prompts/00-BUILD-PROTOCOL.md (including §8, supplemental Muse facts),
prompts/01-REFINEMENT.md, SKILLS-CATALOG.md §1, templates/SKILL.template.md,
tools/check-skills.mjs (to learn exactly what it enforces).

Steps the skill must contain:
1. Confirm the catalog entry: name, priority, group, purpose. Done when the name is in
   SKILLS-CATALOG.md or the user approved a new one.
2. Overlap scan: read every existing description; list the 3 closest and say how this one differs.
3. Gather sources and write a "fact → source file" list before writing any text.
4. Write the description: ≤250 chars, "Use when" with the user's words, "Not for" naming the
   neighbouring skills.
5. Write SKILL.md (eight sections, ≤150 lines; every step has "Done when:").
6. Move anything long (tables, command blocks, examples) into references/.
7. Write evals.md (5 T lines in the user's words, 3 N lines that are real near-misses).
8. Write CHANGELOG.md "0.1.0 — <date> — draft".
9. Run the checker; fix every error and every overlap warning.
10. Place the folder in its function category, skills/<category>/<name>/, using skills-map.json
    (a new skill gets added there in the category that matches its function); in References add a
    line "Related: <skills it pairs with>"; run node tools/skill-map.mjs. Done when: --check passes.
Revise mode (/core-skill-authoring revise <skill>, see SELF-DEVELOPMENT.md): apply only proposals
the user approved; every change gets a CHANGELOG.md line "Because: <TRIALS.md / MISSES.md entry ids>";
add the trial or eval case that would have caught the miss; bump the version (minor for new steps or
rules, patch for wording); then hand over to /core-skill-evals.
Decision rules to include: if a fact has no source → leave it out and list it as an open question;
if two skills would share more than half their steps → propose a merge instead; if SKILL.md passes
150 lines → move detail to references/, never delete steps; core skills never hard-code project
facts.
Anti-patterns: descriptions that list topics instead of situations; steps without a checkable
Done-when; "be careful"-style advice with no action; copying a project's rules instead of linking
them; examples containing real personal text.
Evidence to report: the protocol's §5 report.
references/ to write:
- references/anatomy.md: the eight sections with a filled example of a fictional skill
  "core-example-lint" (synthetic), plus the protocol §8 supplemental rules (gate wording,
  saving state in skills that pause, no dates in SKILL.md, commands not concepts).
- references/description-guide.md: 6 weak descriptions and their rewrites.
- references/revise-mode.md: the revise procedure and the seven recursion rules from
  SELF-DEVELOPMENT.md §3 that apply when revising.

Evals:
T: "write a new skill that teaches you how we do commits" | "this skill is too long and messy,
restructure it" | "make a skill for checking ports" | "turn our release checklist into a skill" |
"add the evals and changelog that this skill is missing"
N: "check whether the commit skill fires when I ask to commit" → core-skill-evals |
"the worktree skill missed something last week, update it from the log" → core-retro |
"write a README for the textclone repo" → none

Trial (R3): write a throwaway skill core-trial-hello in the trial folder (its job: greet the user
by reading .muse/project.json "name"), pass the checker, then delete it. Grade every step.

Refine signals (R5): skills built with it that fail the checker on the first run; descriptions
that fail R2; any section Muse leaves thin.
```

---

## 2.2 `core-skill-evals` · P1 · build after `core-skill-authoring`

```text
Build the skill core-skill-evals. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring to write it.

Description (verbatim; change only if R2 fails):
Use when checking whether a skill fires on the right requests and stays quiet on near-misses, or running a skill's trial. Not for writing a skill (use `core-skill-authoring`) or revising from field logs (use `core-retro`).

Purpose: run refinement stages R1–R3 (01-REFINEMENT.md) for one skill or a group, and record the
results in the same format every time.

Read first: prompts/01-REFINEMENT.md (all of it), tools/check-skills.mjs, the skill core-skill-authoring.

Steps:
1. Pick scope: one skill, a catalog group, or "all changed on this branch"
   (git diff --name-only origin/main...HEAD -- skills/). Done when: the list of skills is written.
2. R1: run the checker on each; stop on errors.
3. R2: open a fresh session per round; run the R2 prompt; fill the results table in evals.md.
4. On an R2 failure, edit only the description/Use when/Not for; max 3 rounds; record each round.
5. R3: run the trial task from the skill's prompt or TRIALS.md; grade every step; append to TRIALS.md.
6. Update CHANGELOG.md status only when R1–R3 all pass and the new version does at least as well
   as the previous one (same trials, plus any fixtures in EVALS.csv).
7. For a group, run R2 for every skill in the group after any description change (R7).
8. No self-grading (SELF-DEVELOPMENT.md §3 rule 1): when the skill under test is one of the four
   self-development skills (core-skill-authoring, core-skill-evals, core-skill-maintenance,
   core-retro), run this procedure from the previous stable version, read with
   git show skill/core-skill-evals/v<last stable>:skills/01-self-development/core-skill-evals/SKILL.md,
   and the checker from the same tag. If no stable tag exists yet, say so and have the user review.
Decision rules: a near-miss that fires the skill is worse than a missed trigger (it does wrong
work) → fix it first; never edit or remove T/N lines or trials to make a test pass (tests only grow); if two skills
keep stealing each other's requests after 3 rounds → report "merge candidate" with both names; R2
is a proxy, so never mark a skill stable from R2 alone.
Anti-patterns: running R2 in the session that wrote the skill (it knows the answers); test lines
that copy the description's words; marking "tested" with a failed trial; private data in TRIALS.md.
Evidence: per skill: checker exit, R2 table (T x/y, N x/y, rounds), R3 pass/fail with the step
grades, status change.
references/: references/r2-prompt.md and references/r3-prompt.md (copied from 01-REFINEMENT.md,
with the placeholders explained); references/results-format.md (the results table and TRIALS.md
entry formats).

Evals:
T: "does the dictation skill actually get picked when I ask about voice input?" | "run the trigger
tests for everything in this batch" | "test whether core-commit works on a real commit" |
"the new skills keep firing on the wrong things, check them" | "grade the worktree skill on a trial"
N: "write a skill for flaky tests" → core-skill-authoring | "update core-commit from what went wrong
this week" → core-retro | "run the textclone unit tests" → core-recheck-loop

Trial (R3): run R1 and R2 on core-skill-authoring and on itself; record both in their evals.md.

Refine signals: R2 results that later disagree with field use (a skill that "passed" R2 but was
missed in MISSES.md) → strengthen how T lines are written.
```

---

## 2.3 `core-project-profile` · P1 · build after `core-skill-evals`

```text
Build the skill core-project-profile. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when a project needs its .muse/project.json created, checked or updated (commands, ports, paths, worktrees, flakes), or a shared skill cannot find a project fact. Not for editing the project's own rules files (AGENTS.md).

Purpose: one small file per project that every core skill reads, so no core skill hard-codes a
path, port or command.

Read first: textclone AGENTS.md, docs/AI_WORKFLOW.md (commands table), tasks.md §G2 and §G4, plan.md
§2 and §3 (B-3), docs/ui-redesign/GUARDRAILS.md (ports); orion AGENTS.md, CLAUDE.md, README.md,
package.json.

The schema (write it to references/schema.md, one row per key, with type, meaning, example):
name, root, shell ("powershell"), lane ("A" Standard only | "B" Contributor allowed; see LANES.md), python (venv interpreter, relative), node_pm ("npm.cmd"),
commands.{lint_py, test_focused (with {tests} placeholder), test_unit, test_faults, test_all,
lint_web, typecheck_web, build_web, test_web (null if none)}, web_dir,
worktrees.{root, branch_pattern, setup_ref (a file#section that holds the setup steps)},
ports.{owned[], forbidden[] (with a label for each)},
paths.{rules[], handoff, plan, tasks, roadmap, protected[], private[]},
recheck.{consecutive_passes, max_fix_cycles},
known_flakes[{id, test, signature (regex), until}],
checkpoints.{approval_phrase},
frontend.{framework, version, docs_dir}.
Every value must be copied from a project file you opened; cite the file in a "source" column in
references/textclone-example.json.md and references/orion-example.json.md.

Steps:
1. Locate the project root and its rules files. Done when: AGENTS.md (or equivalent) was read.
2. Extract each key from its source; mark unknown keys null with a reason — never guess.
3. Validate: every command's executable exists; every path exists; owned and forbidden ports do
   not overlap.
4. Write .muse/project.json. Write it only through the project's own branch rules: in textclone, a
   worktree on branch muse/project-profile, committing only .muse/project.json; the user merges.
5. Print the diff for the user and stop.
6. Update mode: compare the file with its sources and list stale keys; change only those.
Decision rules: a key with two conflicting sources → stop and ask which is right; never put
secrets, .env values or personal paths beyond the project root in the file; if the project's
AGENTS.md forbids a branch → follow AGENTS.md.
Anti-patterns: guessing a test command; copying the live ports into "owned"; keys outside the
schema; one profile shared by two projects.
Evidence: the JSON, a source per key, validation results, and the branch and commit.

Evals:
T: "set up the muse profile for the orion repo" | "the commit skill doesn't know our test command,
fix the project config" | "check that textclone's .muse file is still right after the port change"
| "add the new known flake to the project settings" | "create the per-project config the shared
skills read"
N: "update AGENTS.md with the new rule" → none | "which ports are free right now?" →
core-port-safety | "start the textclone worktree" → core-worktree

Trial (R3): build textclone's .muse/project.json in a textclone worktree from the sources above,
validate it, and show it to the user without committing. Then do the same for Orion in a scratch
folder and compare: any key that can't be filled for Orion must be null with a reason.

Refine signals: core skills that fail because a key is missing or ambiguous → extend the schema
(and re-run R3 for affected skills per R7).
```

---

## 2.4 `core-skill-maintenance` · P2 · build after the core P1 skills

```text
Build the skill core-skill-maintenance. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when a project changed (files moved, commands renamed, rules updated) and skills may now be stale, or to retire or merge skills. Not for lessons from failed tasks (use `core-retro`) or new skills (use `core-skill-authoring`).

Purpose: keep skills true to the projects as the projects change.

Read first: every SKILL.md's References section (it lists the sources), git log of each project
since each skill's last CHANGELOG date.

Steps:
1. For each skill, list its cited sources. Done when: a skill → sources table exists.
2. For each source, check it still exists and whether it changed since the skill's last version
   (git log --since=<date> -- <file>).
3. For every changed source, diff the facts the skill uses; mark them stale or still true.
4. Patch stale facts; bump the patch version; re-run R1 and R3.
5. Retire: a skill unused in 90 days of field logs, or fully covered by another → propose
   retirement (move to retired/ with a note); never delete.
6. Merge: two skills flagged as merge candidates by core-skill-evals → propose one merged skill.
7. After every merge to main: run node tools/skill-map.mjs (the map and category READMEs are
   generated; --check must pass) and tag each released skill version:
   git tag skill/<name>/v<x.y.z> (the user pushes tags).
8. Rollback (/core-skill-maintenance rollback <skill>): when field use shows a revision did worse,
   restore the folder from the last stable tag on a branch, record "Because: <evidence>" in
   CHANGELOG.md, and hand over to /core-skill-evals.
9. Placement: a skill whose job has drifted into another function → propose moving it in
   skills-map.json and the folder; the map shows the change.
Decision rules: retire or merge only with the user's approval; a renamed source → update the
citation and the fact; a removed source → mark the skill "blocked" and ask.
Anti-patterns: bulk find-and-replace across skills; editing a stable skill without re-running R3;
deleting history.
Evidence: the skill → sources table with stale marks, patches made, proposals awaiting approval.

Evals:
T: "textclone moved its tests folder, check which skills are now wrong" | "audit the skills against
the current repos" | "we don't use the launcher skill anymore, should we retire it?" | "merge the
two testing skills that keep overlapping" | "orion renamed its scripts; refresh the skills"
N: "the commit skill failed twice last week, improve it" → core-retro | "write a skill for backups"
→ core-skill-authoring | "check the skills fire properly" → core-skill-evals

Trial: in a trial copy of the skills repo, rename a cited file in a fake project folder, run the
maintenance pass, and confirm it finds and fixes exactly that citation.

Refine signals: a stale fact found during real use that this pass missed → add that source type to
step 2.
```

---

## 2.5 `core-retro` · P2 · build after `core-skill-maintenance`

```text
Build the skill core-retro. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use at the end of a task (log mode) or after a phase (review mode): capture what skills missed, sort lessons by skill, project or portfolio, and propose evidence-backed edits. Not for stale facts after project changes (use `core-skill-maintenance`).

Purpose: the engine of the recursive self-development loop (SELF-DEVELOPMENT.md). It runs only when
the user or a flow calls it; it never edits a skill itself.

Read first: SELF-DEVELOPMENT.md (all), LESSONS.md, PROJECTS.md, prompts/01-REFINEMENT.md R5–R7,
the field worktree layout and MISSES.md format, EVALS.csv.

Log mode (/core-retro log, at the end of a task; every flow ends with it):
1. For each skill used this task: one field entry in its TRIALS.md — date | task type in 5 words |
   helped: <step> | missed: <what it did not cover, or none>. Done when: one entry per skill.
2. Moments where a skill should have been used and wasn't → MISSES.md.
3. Sort each lesson: skill-specific (stays in TRIALS.md), project-specific (propose a
   .muse/project.json fact or a project-skill step), cross-project (propose a LESSONS.md row with
   status "proposed" and the projects where it was seen).
4. Commit the logs on the field branch ("Field log <date>"). No private data. Done when: committed.
Review mode (/core-retro review, whenever the user chooses):
5. Read all field entries, misses and proposed lessons since the last review, for every skill
   including the four self-development skills (this is what makes the loop recursive).
6. Apply the evidence threshold: the same failure twice → propose the smallest edit; once is
   logged only, unless it caused harm or leaked private data; a gap with no skill twice → propose a
   new skill and its category in skills-map.json.
7. For each proposed or seed lesson in LESSONS.md seen in two or more projects: propose accepting it
   and which core skills should absorb it.
8. Gate: present each proposal (skill, evidence ids, edit, expected effect) and ask
   "Approve, request changes, or cancel?" one at a time; save progress to
   .agents\state\core-retro.json; end each turn with "Re-invoke: /core-retro review continue".
9. Approved proposals go to /core-skill-authoring revise <skill>, then /core-skill-evals; respect
   "one level at a time" (SELF-DEVELOPMENT.md §3 rule 4) when a self-development skill is involved.
Decision rules: one failure is an anecdote → log it; the same failure twice → propose an edit;
never edit a skill or accept a lesson without approval; never schedule itself or run unasked.
Anti-patterns: blaming the model instead of the instructions; vague lessons ("be more careful");
private text in logs; editing several skills in one commit; proposals without evidence ids.
Evidence: log mode — entries written and lessons sorted; review mode — the item → skill table,
proposals with evidence ids, approvals received, lessons accepted.
Evals:
T: "phase 3 is done, what should we learn from it?" | "that task took four retries, capture why" |
"do a retro on this week's runs" | "log what the skills missed today" | "which skills need improving
after this phase?"
N: "the repo layout changed, update skills" → core-skill-maintenance | "write the handoff for Codex"
→ core-codex-handoff | "summarise what changed in this phase" → core-report-writer

Trial: run a retro on a synthetic phase log (write 6 invented events, 2 of them repeats) and
check that only the repeated failure produces an edit proposal.

Refine signals: proposals the user rejects → tighten step 4's evidence bar.
```

---

## 2.6 `core-trace-report` · P2 · build after `core-retro` (supplemental: docs/MUSE-REFERENCE.md §6)

```text
Build the skill core-trace-report. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use at the end of a task or session to pin what ran: lane and model, skills used, gates and answers, checks, and a redacted session export with its SHA-256. Not for the chat summary (use `core-report-writer`).

Purpose: tie a piece of work to Muse's own event log, so it can be audited later.

Read first: docs/MUSE-REFERENCE.md §6.1–6.2 (harness log, muse export, --redacted, SHA-256 pinning),
VERIFIED.md rows for export, session id and session-log location, LANES.md,
core-report-writer and core-handoff-writer (do not duplicate them).

Steps:
1. Collect: lane and model as the user stated them this session (ask if not stated); the
   skills-repo commit (git -C C:\Users\ddrac\muse-skills rev-parse --short HEAD is an example; read
   the path from VERIFIED.md); the skills invoked; check commands with exit codes. Done when: listed.
2. Export: muse export --last --redacted --out trace\<timestamp>.json (only if VERIFIED.md confirms
   the flags); Get-FileHash -Algorithm SHA256. Done when: file and hash exist, or "no export: <reason>".
3. Write the report to the handoff's trace subsection (or trace\<timestamp>.md if the project has
   no handoff): the fields above plus the export path and hash.
4. Flag: a lane stated as B in a Lane-A project; any sign of --yolo or --no-session-log.
Decision rules: never export unredacted; a session id that cannot be found is written "unknown",
never guessed; trace\ is git-ignored.
Anti-patterns: pasting export content into the report; claiming a lane the user did not state.
Evidence: the report and the hash.

Evals:
T: "pin this session before we stop" | "export the session and record the hash" | "write the audit
trail for today's run" | "which skills and checks ran this session? record it" | "make a trace of
this work"
N: "tell me how the task went" → core-report-writer | "update the handoff" → core-handoff-writer |
"what approvals happened in yesterday's export?" → core-session-audit

Trial: in a trial folder with a synthetic handoff, run the skill with "Lane A" stated; if
muse export is unverified, it must write "no export: unverified" rather than inventing flags.

Refine signals: reports that could not be matched to a session later.
```

---

## 2.7 `core-session-audit` · P2 · build after `core-trace-report` (supplemental: docs/MUSE-REFERENCE.md §6.1)

```text
Build the skill core-session-audit. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when reviewing what a past Muse session actually did from its redacted export: approvals and who decided them, side effects, skills loaded, failed tools. Not for pinning the current session (use `core-trace-report`).

Purpose: an evidence-based audit from Muse's append-only record.

Read first: docs/MUSE-REFERENCE.md §6.1 (envelope fields; side_effect_intent with policy_decision;
decision_source), VERIFIED.md (only field names confirmed there may be used).

Steps:
1. Locate the redacted export; compute its SHA-256; compare with any trace report naming it.
2. Parse with a short PowerShell or Python script (stdlib); field names from VERIFIED.md only.
3. Table: approvals (what, decision, who decided), side effects (intent, policy decision), skills
   loaded, failed tool calls.
4. Flag: writes without an approval record; approvals decided automatically on writes outside the
   task's scope.
Decision rules: unknown field names → stop and ask for VERIFIED.md to be updated; unredacted export
→ stop and ask for a redacted one.
Anti-patterns: modifying exports; quoting payload text beyond what identifies the event.
Evidence: the counts, the flagged rows with sequence numbers, the export hash.

Evals:
T: "audit yesterday's session" | "which approvals were automatic in that run?" | "did anything write
files without approval?" | "check this export for side effects" | "what skills loaded in that
session?"
N: "pin this session" → core-trace-report | "summarise the work" → core-report-writer | "review my
diff" → core-diff-self-review

Trial: audit a synthetic redacted export (built from VERIFIED.md field names) with 3 approvals,
one automatic on a write; it must flag that one.

Refine signals: false flags; event types missing from the table.
```
