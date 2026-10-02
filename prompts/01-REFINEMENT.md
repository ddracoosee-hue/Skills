# Refinement: the evaluate-and-revise loop for every skill

Skills do not train Muse. A skill improves only when its SKILL.md text is edited because of
measured evidence:
- Does it load when named, and stay unloaded otherwise?
- Does following it produce a correct result, repeatedly, on a fixture where the right answer can
  only come from reading the files?
- What went wrong in real use?

This loop replaces the idea of "post-training".

Every skill climbs this ladder. Its status is the newest heading in `CHANGELOG.md`.

| Status | Reached when | Stages |
| --- | --- | --- |
| `draft` | Built and committed | R1 |
| `tested` | Routes correctly, and its fixture passes the ship rule | R1, R2, R3 |
| `reviewed` | A second agent verified every fact | R4 |
| `stable` | 3 real uses in a row with no miss | R5, R6 |

**Ship rule:** a version ships only if its fixture pass rate is at least 4/5 and at least the
previous version's. The P1 traceability skills (`core-trace-report`, `core-session-audit`,
`core-project-profile`) need 5/5 on Lane A.

**Scorecard:** one row per run batch goes in [`EVALS.csv`](../EVALS.csv). The columns are: date,
skill, version, skills_sha, muse_version, model, lane, fixture, runs, passes, mean_steps,
approvals, artifacts_ok, routing_t, routing_n, export_sha256, notes.

---

## R1. Structure check

1. `python tools/check_skills.py skills/<name>` exits 0. It checks:
   - the frontmatter and name;
   - the description's four parts (≤350 chars);
   - the heading version against CHANGELOG;
   - the nine sections in order, and `Done when:` on every step;
   - the gate wording, the re-invoke line, the Outputs path and the Trace block fields;
   - no dates in the body, and that referenced files exist;
   - the evals.md and CHANGELOG.md formats;
   - fixtures (no `.git`, prompt.txt, a verify script);
   - the secret and personal-path scan;
   - description overlap with other skills.
2. `muse skills validate skills/<name>` passes. This is Muse's own check (VERIFIED.md #21).

---

## R2. Routing check

**Why:** the description is the routing contract. Skills are explicit-invocation only, so two
things must hold. When the skill is named or suggested for its job, it is the right one. On
ordinary or near-miss requests, it never loads by itself.

`evals.md` format:

```markdown
# Evals: <name>

## Should route here
- T1: "<a request a user would really type for this job>"

## Must not load
- N1: "<a near-miss request>" → `<the skill that should take it>`
- N2: "<an ordinary request>" → none

## Results
| Date | Round | Method | Should route | Must not load | Changed |
| --- | --- | --- | --- | --- | --- |
```

Write the requests in different words from the description. Use at least 3 T and 2 N lines; aim
for 5 and 3.

**R2a. Routing proxy** (fresh session, run in the batch worktree):

```text
This is a skill routing test. Do not perform any request.
Read every skills/*/SKILL.md frontmatter here (descriptions only).
For each "- T" and "- N" line of skills/<name>/evals.md, choose from the quoted request text only:
request id | the one skill you would name or suggest (or "none") | the description phrase that
decided it. Ignore everything after the closing quote until your table is complete, then add a
column: matches expected? (yes/no).
```

**R2b. Explicit-only check** (log-based; needs VERIFIED.md #13 and #17). Run each N request
headlessly in a fixture copy, without naming the skill. Then search the run's JSON stream or
`session.jsonl` for a load of `<name>`, using the event recorded in VERIFIED.md #13. There must
be **zero** loads. If #13 is still unverified, record "R2b skipped: load event unverified".

**Pass:** every T routes to `<name>`, every N to its target (or none), and R2b shows zero
unrequested loads.

**On a failure:** change only the description and the Trigger contract, never the test lines.
Re-run in a new session. Use at most 3 rounds, and record each in Results and in EVALS.csv
(`routing_t`, `routing_n`). If round 3 still fails, report the competing skill as a merge
candidate.

---

## R3. Fixture runs (grounding), plus project trial

**Why:** a skill can route perfectly and still give bad instructions. The fixture uses invented
terms, so a correct result can only come from reading the files. This is Meta's own cookbook
method ("Glimber", "Quokkascale", "Frobnitz-9").

**Fixture layout** (plain files in the skill folder; the harness copies them to a temporary folder
and runs `git init` plus one commit):

```
fixtures/<case>/
  prompt.txt     starts by invoking the skill by name: "/<name> …"
  verify.py      exits 0 only if the expected files and content exist (or verify.ps1 / verify.sh)
  <files>        the tiny invented-term repo, including .muse/project.json and AGENTS.md
```

**Headless run** (through `tools/run_fixture`, built in Phase 1; flags per VERIFIED.md #17):

```
muse exec --model <model from VERIFIED.md #3> --max-model-steps 60 --json --prompt-file prompt.txt > run.jsonl
```

- **The verify script decides pass or fail**, never the exit code.
- **Drafts load as project skills.** The harness copies the draft into the fixture's
  `.agents/skills/<name>/` and confirms with `muse skills inspect <name>` that the draft is the
  one resolved. If VERIFIED.md #10 shows user skills beat project skills, it uses a temporary id
  `<name>-draft` instead.
- **Trust.** The fixture folder is trusted per VERIFIED.md #19.

**Runs:**
- 5 runs (the model is non-deterministic) on Lane B. Fixtures are invented data, so this is
  allowed by `LANES.md`.
- Plus 1 cross-lane run on Lane A. Both lanes should pass; if only one does, record it in
  VERIFIED.md.

**Record in EVALS.csv:** passes/runs, mean model steps, approvals requested, artifacts written
correctly (`artifacts_ok`), and the SHA-256 of `muse export --last --redacted` for the reference
passing run (the regression pin).

**Project trial** (project skills, in a project worktree on Lane A, synthetic data only). Paste
this in a fresh session:

```text
Invoke /<name> and follow it exactly on this task: <the trial task from the skill's prompt>.
Work only in <worktree>. Synthetic data only.
Then grade every Procedure step: step | Done-when met? | evidence (command + exit code, file, quote) |
instruction clear / wrong / missing something. List any step you improvised, any instruction that
was wrong for this project, any "Do not" you nearly broke. Append to skills/<name>/TRIALS.md under
"## Trials" with today's date and the run file path. No private data.
```

**On a failure:** fix SKILL.md or `references/`, re-run R1, and run the fixture again. Use at most
3 cycles. When the ship rule passes, add `## 0.2.0 — <date> — tested` to CHANGELOG.md and bump the
heading.

---

## R4. Cross-review (once per batch)

Give this to Codex (or Claude Code) in the batch worktree:

```text
Review the skills changed on branch muse/skills-<batch> (git diff origin/main...HEAD -- skills/).
For each skill, check against the real files:
1. Every path, command, port, key and rule exists and says what the skill says (cite file:line;
   compare with the skill's references/sources.md).
2. Every Muse feature used is verified in VERIFIED.md or tagged [Certain]; flag anything else.
3. Rules never contradict the touched project's AGENTS.md, CLAUDE.md, tasks.md G1–G8, GUARDRAILS.md.
4. The nine sections are complete: could an agent with no other context reach every Done-when?
   Gates use the exact question; multi-turn skills save state and print the re-invoke line.
5. Descriptions do not overlap (python tools/check_skills.py; read warnings).
6. No private data, no personal paths, no invented numbers. Fixtures use invented terms only.
Report findings by severity with file:line, evidence and the exact fix. Do not edit.
```

Muse applies the fixes (one commit per skill: "Fix skill <name> from review"), re-runs R1–R3 for
each changed skill, and adds `## 0.3.0 — <date> — reviewed`.

---

## R5. Field use (every real use)

Every skill run already writes `.agents/runs/<name>/…` with its Trace block. Field use adds one line
that links that run to the skill. Paste this at the end of a normal task message until `core-retro`
exists:

```text
When you finish, for each skill you invoked, append to skills/<name>/TRIALS.md in
C:\Users\ddrac\muse-skills-wt\field (branch muse/skills-field) under "## Field use":
- <date> | <task type in 5 words> | run file <path> | session <id or unknown> | helped: <step> |
  missed: <what it did not cover, or none>
Note any moment where a skill should have been named or suggested and wasn't in
C:\Users\ddrac\muse-skills-wt\field\MISSES.md. Commit "Field log <date>". No private data.
```

Create the field worktree once:
`git -C C:\Users\ddrac\muse-skills worktree add C:\Users\ddrac\muse-skills-wt\field -b muse/skills-field origin/main`.

---

## R6. Revision (after 3 field uses, or after any miss)

```text
Revise the skill <name>. Read its SKILL.md, references/, TRIALS.md ("Watch for", trials and field
entries), MISSES.md lines naming it, and its EVALS.csv rows. For each miss decide: add a Procedure
step, a gate, a failure case, a Do-not line, a sharper description, a new fixture case, or no change
(say why). Make the smallest edit that covers the evidence; add a fixture case that would have
caught the miss. Run R1, R2 and R3. Apply the ship rule against the previous version's pass rate.
Bump the version (minor for new steps or rules, patch for wording) in the heading and CHANGELOG.md.
Mark "stable" only if the last 3 field uses had no miss and R1–R3 pass. Report what changed and which
entries caused it.
```

## R7. Regression and drift

- **A change to any skill:** re-run R1 and R3 for that skill, and R2 for every skill in its
  catalog group, because descriptions compete.
- **A change to the `.muse/project.json` schema:** re-run R3 for every core skill that reads the
  changed keys.
- **Monthly, or after a Muse update** (Muse docs and defaults drift; `muse --version` changes):
  re-run every fixture, append the rows to EVALS.csv, and update VERIFIED.md.
