# Prompts: 2. Foundation and traceability

Build these first, after `05-environment-and-tools.md` E0–E2 (VERIFIED.md filled in, the fixture
harness working). Every later skill is:
- written with `core-skill-authoring`;
- tested with `core-skill-evals`;
- portable through `core-project-profile`;
- traceable through `core-trace-report` and `core-session-audit`.

Batch name: `foundation`. Lane A. Paste one block per message. Each block is complete on its own.

---

## 2.1 `core-skill-authoring` · P1 · build first

```text
Build the skill core-skill-authoring. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). This is the first skill, so there are no others to check for
overlap yet.

Description (verbatim; change only if R2 fails):
Use when writing a new Muse skill or restructuring one in the skills repo: description contract, nine sections, fixture, evals, changelog. Not for routing tests or fixture runs (use `core-skill-evals`) or revising from field logs (use `core-retro`). Runs only when invoked by name. Writes .agents/runs/core-skill-authoring/.

Purpose: turn 00-BUILD-PROTOCOL.md into a skill, so every Muse session writes skills the same way
even when the protocol file is not open.

Read first: prompts/00-BUILD-PROTOCOL.md (all of it, especially §0 key concepts, §3 description,
§4 nine sections and the prompt-field mapping, §5 writing rules), templates/SKILL.template.md,
prompts/01-REFINEMENT.md, VERIFIED.md, LANES.md, tools/check_skills.py (what it enforces).

Steps the skill must contain:
1. Confirm the catalog entry (name, priority, group, purpose). Done when: the name is in
   SKILLS-CATALOG.md or the user approved a new one.
2. Overlap scan: read every description; list the 3 closest and how this one differs.
3. Sources: write references/sources.md (fact → file:line) before any skill text. Muse facts only
   from VERIFIED.md.
4. Description: the four parts (use when / not for / runs only when invoked by name / writes
   .agents/runs/<name>/), ≤350 chars, the nouns users type.
5. SKILL.md from the template: heading with version, nine sections in order, every Procedure step
   with an exact command or file action and "Done when:", gates with the exact question, state
   file + "Re-invoke:" line for any gate, Trace block fields, named failures, Do-not list.
6. Long material → references/, loaded with "If …, read references/x.md".
7. evals.md (5 T, 3 N), CHANGELOG.md (0.1.0 draft), TRIALS.md ("## Watch for" from the prompt).
8. Fixture: rewrite the trial task as an invented-term repo under fixtures/<case>/ with
   prompt.txt and a verify script that fails on the untouched copy.
9. R1: python tools/check_skills.py skills/<name>, then muse skills validate.
Rules to put inline or in Gates: a fact with no source → leave it out and list it as an open
question; two skills sharing over half their steps → propose a merge; SKILL.md past 150 lines →
move detail to references/, never drop steps; no dates or run data in SKILL.md (cache stability).
Do not: descriptions listing topics instead of situations; steps without commands; "be careful"
advice; copying project rules instead of reading them; real names, text or paths in fixtures.
Outputs/trace: the protocol §7 report inside the run file.
references/ to write: references/anatomy.md (the nine sections, filled for a fictional skill
"core-example-lint"), references/description-guide.md (6 weak descriptions and rewrites),
references/fixture-guide.md (how to turn a trial task into an invented-term fixture, with the
"Glimber" example and a verify.py skeleton).

Evals:
T: "write a new skill that teaches you how we do commits" | "this skill is messy, restructure it
into the standard sections" | "make a skill for checking ports" | "turn our release checklist into
a skill" | "add the fixture, evals and changelog this skill is missing"
N: "check whether the commit skill routes correctly" → core-skill-evals | "update the worktree skill
from last week's misses" → core-retro | "write a README for textclone" → none

Trial (fixture): fixtures/greeter/ — an invented project "Quokkascale" whose AGENTS.md asks for a
skill that greets the user by the project name in .muse/project.json; prompt.txt invokes
/core-skill-authoring to create core-trial-greeter in the fixture's skills/ folder; verify.py runs
python tools/check_skills.py on the produced skill (copy the checker into the fixture) and requires
exit 0.

Refine signals (TRIALS.md "Watch for"): skills that fail R1 on the first run; descriptions failing
R2; thin Gates or Failure handling sections.
```

---

## 2.2 `core-skill-evals` · P1 · build after `core-skill-authoring`

```text
Build the skill core-skill-evals. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use /core-skill-authoring to write it.

Description (verbatim; change only if R2 fails):
Use when testing a skill: structure check, routing proxy, explicit-only log check, fixture runs on both lanes, EVALS.csv scorecard and ship rule. Not for writing a skill (use `core-skill-authoring`) or revising from field logs (use `core-retro`). Runs only when invoked by name. Writes .agents/runs/core-skill-evals/.

Purpose: run refinement stages R1–R3 for one skill or a group and record results the same way
every time.

Read first: prompts/01-REFINEMENT.md (all), tools/check_skills.py, tools/run_fixture.* and its
usage, EVALS.csv header, VERIFIED.md #10 #13 #17–#20, LANES.md.

Steps:
1. Scope: one skill, a catalog group, or all changed on this branch
   (git diff --name-only origin/main...HEAD -- skills/). Done when: the list is written.
2. R1: check_skills.py and muse skills validate per skill; stop on errors.
3. R2a: a fresh session per round with the R2a prompt; fill evals.md Results.
4. R2b: run each N request headlessly in a fixture copy without naming the skill; search the
   stream for the load event from VERIFIED.md #13; zero loads required (or record "skipped").
5. R3: run_fixture -Runs 5 -Lane B, then -Runs 1 -Lane A; read EVALS.csv rows.
6. Ship rule: pass rate ≥ 4/5 and ≥ the previous version's (5/5 on Lane A for P1 traceability
   skills); only then update CHANGELOG status and heading version.
7. Group: after any description change, R2 for every skill in the group (R7).
Rules: a near-miss that loads the skill is worse than a missed route → fix it first; never edit
T/N lines to pass (add new ones); merge candidate after 3 failed rounds; R2a is a proxy and never
alone marks a skill tested; Lane B only after the privacy scan passes.
Do not: run R2a in the session that wrote the skill; use muse's exit code as the result; mark
"tested" with a failed fixture; put private data in TRIALS.md or fixtures.
Outputs/trace: per skill: R1 results, R2 table (T x/y, N x/y, method, rounds), R2b loads, R3
passes/runs per lane, mean steps, export SHA-256, status change.
references/: references/r2a-prompt.md, references/r2b-procedure.md, references/project-trial-prompt.md
(from 01-REFINEMENT.md), references/scorecard.md (EVALS.csv columns and the ship rule).

Evals:
T: "does the dictation skill actually route when I ask about voice input?" | "run the fixtures
for everything in this batch" | "test core-commit on both lanes" | "the new skills load on ordinary
requests, check them" | "is version 0.3 at least as good as 0.2?"
N: "write a skill for flaky tests" → core-skill-authoring | "improve core-commit from this week's
misses" → core-retro | "run the textclone unit tests" → core-recheck-loop

Trial (fixture): fixtures/scorecard/ — a fixture containing a tiny probe skill and an EVALS.csv
with one prior row (4/5); prompt.txt invokes /core-skill-evals on the probe with a supplied set
of 5 canned run results (3 pass); verify.py checks the skill refused to mark it tested (3/5 < 4/5)
and appended a correct EVALS.csv row.

Refine signals: R2 passes that later disagree with MISSES.md; fixture pass rates that swing more
than 2/5 between identical runs (the fixture is too loose).
```

---

## 2.3 `core-project-profile` · P1 · build after `core-skill-evals`

```text
Build the skill core-project-profile. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use /core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when a project needs its .muse/project.json and LANES.md created, checked or updated (commands, ports, paths, lane, worktrees, flakes), or a shared skill cannot find a project fact. Not for editing AGENTS.md rules. Runs only when invoked by name. Writes .agents/runs/core-project-profile/.

Purpose: one small file per project that every core skill reads, plus the project's lane policy.

Read first: textclone AGENTS.md, docs/AI_WORKFLOW.md (commands table), tasks.md §G2 and §G4,
plan.md §2 and §3 (B-3), docs/ui-redesign/GUARDRAILS.md (ports), .gitignore; orion AGENTS.md,
CLAUDE.md, README.md, package.json; this repo's LANES.md.

The schema (write references/schema.md, one row per key: type, meaning, example, source):
name, lane ("A" | "B") and lane_reason, never_in_lane_b[] (paths), shell ("powershell" | "bash"),
python (venv interpreter, relative), node_pm, commands.{lint_py, test_focused (with {tests}),
test_unit, test_faults, test_all, lint_web, typecheck_web, build_web, test_web (null if none)},
web_dir, worktrees.{root, branch_pattern, setup_ref (file#section)}, ports.{owned[], forbidden[]
with a label each}, paths.{rules[], handoff, plan, tasks, roadmap, protected[], private[]},
recheck.{consecutive_passes, max_fix_cycles}, known_flakes[{id, test, signature, until}],
checkpoints.{approval_phrase}, frontend.{framework, version, docs_dir},
traces.{runs_dir ".agents/runs", state_dir ".agents/state", export_dir "trace"}.
No absolute personal paths in the schema file; "root" is never stored (skills use the working
directory). Every value comes from a project file you opened; cite it in
references/textclone-example.md and references/orion-example.md.

Steps:
1. Locate the project root and rules files. Done when: AGENTS.md (or equivalent) was read.
2. Extract each key from its source; unknown keys are null with a reason — never guess.
3. Validate: each command's executable exists; each path exists; owned and forbidden ports do not
   overlap; lane matches LANES.md policy (Textclone and Orion are Lane A only).
4. Draft .muse/project.json, a project LANES.md (template in this repo's LANES.md), the .gitignore
   lines for .agents/runs/, .agents/state/ and trace/, and one AGENTS.md line that points to
   LANES.md — as a diff.
5. Gate: show the diff and ask "Approve, request changes, or cancel?"; save state to
   .agents/state/core-project-profile.json; end with "Re-invoke: /core-project-profile continue".
6. On approval: write them in a project worktree on branch muse/project-profile and commit only
   those files; the user merges.
7. Update mode: compare the file with its sources; list stale keys; change only those.
Rules: two conflicting sources → ask which is right; no secrets or .env values; if AGENTS.md
forbids a branch name → follow AGENTS.md.
Do not: guess a command; list live ports as owned; add keys outside the schema; share one profile
between projects.
Outputs/trace: the JSON, a source per key, validation results, branch and commit.

Evals:
T: "set up the muse profile for the orion repo" | "the commit skill doesn't know our test command,
fix the project config" | "check textclone's .muse file after the port change" | "add the new known
flake to the project settings" | "write the lane policy for this repo"
N: "update AGENTS.md with a new rule" → none | "which ports are free right now?" →
core-port-safety | "start the textclone worktree" → core-worktree

Trial (fixture): fixtures/frobnitz/ — an invented repo "Frobnitz-9" with an AGENTS.md naming its
test command, a package.json with lint/build scripts, a .gitignore and two port numbers in a
README; prompt.txt invokes /core-project-profile and pre-answers the gate "Approve"; verify.py
checks .muse/project.json has exactly the source values, null-with-reason for the rest, and lane
"B" only because the fixture's README says it has no private data.
Project trial: build textclone's profile in a textclone worktree up to the gate; do not commit.

Refine signals: core skills failing because a key is missing or ambiguous → extend the schema and
re-run R3 for skills that read it (R7).
```

---

## 2.4 `core-trace-report` · P1 · build after `core-project-profile`

```text
Build the skill core-trace-report. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use /core-skill-authoring. Ship rule: fixture 5/5 on Lane A.

Description (verbatim; change only if R2 fails):
Use at the end of a task or session to write the trace report: what ran, lane and model, gates and answers, checks, and a redacted session export with its SHA-256. Not for summarising approvals from an export (use `core-session-audit`). Runs only when invoked by name. Writes .agents/runs/core-trace-report/.

Purpose: the human-readable side of traceability, joined to Muse's event log by session id and to
the exact skill text by the skills-repo git sha.

Read first: docs/MUSE-REFERENCE.md §6.1–6.2, VERIFIED.md #13 #15 #16 #20, LANES.md; prompts/00-BUILD-PROTOCOL.md §4 Trace block; templates/SKILL.template.md.

Steps:
1. Read .muse/project.json (traces.runs_dir, traces.export_dir, lane). Done when: loaded or the
   user was asked for /core-project-profile.
2. Collect: lane and model as the user stated them this session (ask if not stated); session id
   (method from VERIFIED.md #16, else "unknown"); skills-repo sha
   (git -C <live skills clone> rev-parse --short HEAD); run files written this session under
   traces.runs_dir.
3. Export: muse export --last --redacted --out <export_dir>/<session_id or timestamp>.json; compute
   SHA-256 (Get-FileHash / sha256sum). Done when: file and hash exist.
4. Write the report: the Trace block fields, one line per skill run linked to its run file, gates
   with answers, check commands with exit codes, and "turn finished ≠ work correct" status per
   change.
5. Flag mismatches: a run file whose lane differs from the stated lane; any session log flag
   such as --yolo or --no-session-log seen in the export (traces are invalid).
Gates: None: writes only to .agents/runs/ and the export dir.
Failure handling: export command fails → record the error, keep the report, mark "no export";
session id unknown → join by timestamp and say so.
Do not: export unredacted; paste export content into the report; claim a lane the user did not
state.
references/: references/report-format.md (the report layout with a synthetic example).

Evals:
T: "write the trace for this session" | "export the session and record the hash" | "make the audit
record before we stop" | "what ran this session? write it down with the export" | "pin this run"
N: "list the approvals in yesterday's export" → core-session-audit | "update the handoff" →
core-handoff-writer | "tell me how the task went" → core-report-writer

Trial (fixture): fixtures/glimber/ — an invented project with two pre-made run files under
.agents/runs/ (one claiming lane B while the user states lane A); prompt.txt states "Lane A" and
invokes /core-trace-report; verify.py checks the report lists both runs, flags the lane mismatch,
and either names an export file with a 64-hex SHA-256 or says "no export" with the error.

Refine signals: reports the ledger (tools/trace_ledger.py) cannot parse; missing session ids.
```

---

## 2.5 `core-session-audit` · P1 · build after `core-trace-report`

```text
Build the skill core-session-audit. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use /core-skill-authoring. Ship rule: fixture 5/5 on Lane A.

Description (verbatim; change only if R2 fails):
Use when reviewing what a Muse session actually did from its export: approvals and who decided them, side effects, skill loads, failed tools, policy decisions. Not for writing this session's trace (use `core-trace-report`). Runs only when invoked by name. Writes .agents/runs/core-session-audit/.

Purpose: an evidence-based audit of a session, from Muse's own append-only record.

Read first: VERIFIED.md #13 #15 #20 (real event and field names); the harness facts in
docs/MUSE-REFERENCE.md §6.1 (envelope fields sequence, recorded_at, record_type, durability, payload_type,
payload; side_effect_intent with policy_decision and idempotency_key; decision_source with
context_digest) — use only names VERIFIED.md confirms.

Steps:
1. Locate the export (path given, or the newest in traces.export_dir); compute its SHA-256 and
   compare with any trace report that names it.
2. Parse it with a short script (python, stdlib); never read secrets — use redacted exports only.
3. Table: approvals (what, decision, decision_source), side effects (intent, policy_decision),
   skill loads, failed tool calls, model and lane signals.
4. Flags: side effects without approval records, approvals decided by an automatic judge on
   writes outside .agents/runs/, sessions without a log, lane mismatches.
5. Write the audit with counts first, then flagged rows with sequence numbers.
Gates: None: read-only except the run file.
Failure handling: unknown field names → stop and ask for VERIFIED.md to be updated; unredacted
export → stop and ask for a redacted one.
Do not: modify exports; quote payload text beyond what identifies the event.
references/: references/fields.md (the verified field names), references/parse-snippet.md.

Evals:
T: "audit yesterday's session" | "which approvals were automatic in that run?" | "did anything write
files without approval?" | "check this export for side effects" | "what skills loaded in session X?"
N: "write the trace for this session" → core-trace-report | "summarise the work for me" →
core-report-writer | "review my diff" → core-diff-self-review

Trial (fixture): fixtures/audit/ — a synthetic redacted export JSON built from the verified field
names, with 3 approvals (one automatic on a write) and 1 failed tool; verify.py checks the counts
and that the automatic write approval is flagged with its sequence number.

Refine signals: flags that turn out to be false; event types missing from the table.
```

---

## 2.6 `core-skill-maintenance` · P2 · build after the core P1 skills

```text
Build the skill core-skill-maintenance. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when a project changed (files moved, commands renamed, rules updated) and skills may now be stale, or to retire or merge skills. Not for lessons from failed tasks (use `core-retro`) or new skills (use `core-skill-authoring`). Runs only when invoked by name. Writes .agents/runs/core-skill-maintenance/.

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

## 2.7 `core-retro` · P2 · build after `core-skill-maintenance`

```text
Build the skill core-retro. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use at the end of a phase or a hard task to record what failed or wasted time and propose skill edits from the evidence. Not for project changes making skills stale (use `core-skill-maintenance`). Runs only when invoked by name. Writes .agents/runs/core-retro/.

Purpose: automate refinement stages R5 and R6 so skills keep improving from real work.

Read first: prompts/01-REFINEMENT.md R5–R7 (field use, revision, ship rule), the field worktree
layout, MISSES.md format, EVALS.csv, the run files under .agents/runs/** (their Trace blocks), and
/core-session-audit output for the phase's sessions.

Steps:
1. Collect evidence for the phase: failed checks, retries, stop conditions hit, questions asked,
   time sinks — from run files, session audits and the handoff, never from memory. Done when: a
   list with one line each, each citing its run file or audit row, exists.
2. Map each item to the skill that should have prevented it, or "no skill" (a new-skill candidate).
3. Write the R5 field entries (3 lines per loaded skill) and MISSES.md lines.
4. For each skill with 3 new entries or any miss, draft the smallest R6 edit; do not apply it.
5. Present the proposals: skill, evidence lines, proposed edit, expected effect.
6. Gate: "Approve, request changes, or cancel?" per proposal; save state to
   .agents/state/core-retro.json; end with "Re-invoke: /core-retro continue".
7. On approval, apply them via /core-skill-authoring, run R1–R3 and the ship rule (R7 for groups).
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
