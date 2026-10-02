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

Read first: prompts/00-BUILD-PROTOCOL.md, prompts/01-REFINEMENT.md, SKILLS-CATALOG.md §1,
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
  "core-example-lint" (synthetic).
- references/description-guide.md: 6 weak descriptions and their rewrites.

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
6. Update CHANGELOG.md status only when R1–R3 all pass.
7. For a group, run R2 for every skill in the group after any description change (R7).
Decision rules: a near-miss that fires the skill is worse than a missed trigger (it does wrong
work) → fix it first; never edit T/N lines to make a test pass (only add new ones); if two skills
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
name, root, shell ("powershell"), python (venv interpreter, relative), node_pm ("npm.cmd"),
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
Use at the end of a phase or a hard task to record what failed or wasted time and propose skill edits from the evidence. Not for project changes making skills stale (use `core-skill-maintenance`).

Purpose: automate refinement stages R5 and R6 so skills keep improving from real work.

Read first: prompts/01-REFINEMENT.md R5–R7, the field worktree layout, MISSES.md format.

Steps:
1. Collect evidence for the phase: failed checks, retries, stop conditions hit, questions asked,
   time sinks (from the handoff and the session). Done when: a list with one line each exists.
2. Map each item to the skill that should have prevented it, or "no skill" (a new-skill candidate).
3. Write the R5 field entries (3 lines per loaded skill) and MISSES.md lines.
4. For each skill with 3 new entries or any miss, draft the smallest R6 edit; do not apply it.
5. Present the proposals: skill, evidence lines, proposed edit, expected effect.
6. On approval, apply them via core-skill-authoring and run R1–R3 (R7 for groups).
Decision rules: one failure is an anecdote → log it; the same failure twice → propose an edit;
a failure with no matching skill twice → propose a new skill; never edit a skill without approval.
Anti-patterns: blaming the model instead of the instructions; vague lessons ("be more careful");
private text in logs; editing several skills in one commit.
Evidence: the item → skill table, entries written, proposals, and approvals received.

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
