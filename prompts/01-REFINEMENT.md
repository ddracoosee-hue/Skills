# Refinement: the post-build training for every skill

"Training" a skill does not change Muse's model. Muse's weights stay the same. What improves is the
skill's text, and it improves only from measured evidence: did Muse pick the skill at the right
moments, did following it produce the right result, and what went wrong in real use.

Every skill moves up this ladder. Its current status is the newest heading in its `CHANGELOG.md`.

| Status | Reached when | Stages |
| --- | --- | --- |
| `draft` | Built and committed | R1 |
| `tested` | Triggers correctly and passed its trial | R1, R2, R3 |
| `reviewed` | A second agent verified every fact and rule | R4 |
| `stable` | 3 real uses in a row with no miss | R5, R6 |

The build (protocol §4) runs R1–R3. R4 runs per batch. R5 and R6 run for as long as the skill exists.
Paste the prompts below as they are, filling in only the `<…>` parts.

---

## R1. Structure check (automatic)

`node tools/check-skills.mjs skills/<category>/<name>` exits 0. This covers the frontmatter, the description
rules, the eight sections in order, `Done when:` on every step, links to existing files, the formats
of `evals.md` and `CHANGELOG.md`, a privacy scan, and description overlap with other skills.

*Supplement:* once VERIFIED.md confirms `muse skills validate`, also run
`muse skills validate skills/<category>/<name>`. That is Muse's own check, and both must pass.

---

## R2. Trigger check

**Why:** a skill that never fires is useless, and one that fires on the wrong request does damage.
This check is a proxy: Muse states which skill it *would* load. It is not a measurement of live
routing, so R5 keeps watching for misses.

`evals.md` format:

```markdown
# Evals: <name>

## Should trigger
- T1: "<a request a user would really type>"
- T2: "…"
- T3: "…"

## Should not trigger
- N1: "<a near-miss request>" → `<the skill that should take it>`
- N2: "<a request no skill should take>" → none

## Results
| Date | Round | Should trigger | Should not | Changed |
| --- | --- | --- | --- | --- |
```

Write the requests in different words from the description, so the check is not just string
matching. Use at least 3 should-trigger and 2 should-not lines; aim for 5 and 3.

**Prompt (run in a fresh Muse session, opened in the batch worktree):**

```text
This is a skill trigger test. Do not perform any of the requests.
Read every skills/*/*/SKILL.md frontmatter in this folder (descriptions only).
Then, for each line of skills/<category>/<name>/evals.md under "Should trigger" and "Should not trigger",
answer in a table: request id | the one skill you would load (or "none") | the phrase in that
skill's description that decided it.
Choose from the quoted request text only. Ignore everything after the closing quote (the expected
answer) until your table is complete, then add a final column: matches expected? (yes/no).
```

**Pass:** every T line picks `<name>`, and every N line picks its arrow target (or none).

**One N line, one verdict.** Score each N line as routed, misfire, or deferred:
- routed: it picked the expected target, and that target is built (or the target is none).
- misfire: it picked anything else.
- deferred: the expected target is not built yet. Record the observed choice, but do
  not count the line as exercised. The expected request and target stay unchanged.
  Deferred lines never trigger a description edit and never consume a round.

**Round verdict.** Pass: every T routed and every N routed. Provisional: every
exercised line routed, zero misfires, at least one N deferred. Anything else fails.
A provisional round is not a full pass: it says "no misfire seen; the full check
waits for targets". Write scores as "N x/y exercised, z deferred", never "x/y" alone.
Record each deferred line's rerun dependency: re-run it when its target exists.

**On a failure:** change only the description and the `## Use when` / `## Not for` sections, never the
test lines, to make the result pass. Re-run in a new session. Use at most 3 rounds, recording each in
`## Results`. If round 3 still fails, stop and report the competing skill: the two may need merging.

*Supplement (optional, once VERIFIED.md shows how a skill load appears in Muse's session log):* the
proxy above shows what Muse *says* it would pick. For stronger evidence, run each "Should not
trigger" request in a throwaway folder. Then search that session's log for a load of `<name>`. There
should be none. Record it in Results as "log check".

---

## R3. Trial run

**Why:** a skill can trigger perfectly and still give bad instructions. The trial makes Muse follow the
skill on a realistic task and grades each step.

Each skill prompt names its trial task. Run it in a trial folder or a project worktree, with synthetic
data only.

**Prompt (fresh session):**

```text
Load the skill <name> from the batch worktree (skills/<category>/<name>/SKILL.md) and follow it exactly on
this task: <the trial task from the skill's prompt>.
Work only in <trial folder or worktree>. Synthetic data only.
After the task, grade every step of the skill: step number | Done-when met? (yes/no) | evidence
(command + exit code, file path, or quote) | was the instruction clear, wrong, or missing something?
Then list: (1) any step you had to improvise because the skill did not say, (2) any instruction that
was wrong for this project, (3) any anti-pattern you nearly committed.
Append the result to skills/<category>/<name>/TRIALS.md under "## Trials" with today's date. No private data.
```

**Pass:** every `Done when` was met, and no improvised step changed the outcome.

**On a failure:** fix `SKILL.md` (or `references/`), re-run R1, and run the trial again in a new
session. Use at most 3 cycles. When it passes, add `## 0.2.0 — <date> — tested` to `CHANGELOG.md`.

*Supplement (optional): fixture runs.* This is Meta's cookbook method, from
`docs/MUSE-REFERENCE.md` §8, and needs the harness from prompt E1. Rewrite the trial task as a
tiny folder in `skills/<category>/<name>/fixtures/<case>/` that uses invented words (for example "Glimber").
With invented words, a correct result can only come from reading the files. Each case holds:

- `prompt.txt`, which invokes the skill by name;
- a `verify.ps1` that checks the result from the files.

`tools\run_fixture.ps1` then runs it headlessly 5 times. The verify script decides pass or fail,
never Muse's exit code. Runs go on Lane B (invented data only), plus one on Lane A, and each
result is a row in `EVALS.csv`. Pass mark: 4 of 5, and no worse than the previous version.
Fixtures add evidence to the trial above; they do not replace it.

---

## R4. Cross-review (once per batch)

**Why:** the author of a skill is the worst checker of its facts. A second agent (Codex, or Claude
Code) checks every claim against the sources.

**Prompt (to Codex or Claude, in the batch worktree):**

```text
Review the skills changed on branch muse/skills-<batch> (git diff origin/main...HEAD -- skills/).
For each skill, check against the real files:
1. Every path, command, port, key and rule exists and says what the skill says (cite file:line).
2. Decision rules never contradict AGENTS.md, CLAUDE.md, tasks.md G1–G8 or GUARDRAILS.md of the
   project they touch.
3. Steps are complete: could an agent with no other context follow them to the Done-when?
4. Descriptions do not overlap other skills (run node tools/check-skills.mjs and read warnings).
5. No private data, no invented numbers.
Report findings ordered by severity with file:line, the evidence, and the exact fix. Do not edit.
```

Muse then applies the fixes (one commit per skill: `Fix skill <name> from review`), re-runs R1 and
R2 for each changed skill, and adds `## 0.3.0 — <date> — reviewed`.

---

## R5. Field use (every real use, for the life of the skill)

**Why:** real tasks find what trials miss. The record is 3 lines, so it costs nothing.

**Prompt (append to the end of any normal task message, once skills exist):**

```text
When you finish, for each skill you loaded this task, append to skills/<category>/<name>/TRIALS.md in
C:\Users\ddrac\muse-skills-wt\field (branch muse/skills-field) under "## Field use":
- <date> | <task type in 5 words> | helped: <step> | missed: <what it did not cover, or none>
Also note any request where you expected a skill to fire and none did, in
C:\Users\ddrac\muse-skills-wt\field\MISSES.md. Commit with "Field log <date>". No private data.
```

Create the field worktree once:
`git -C C:\Users\ddrac\muse-skills worktree add C:\Users\ddrac\muse-skills-wt\field -b muse/skills-field origin/main`.

After `core-retro` is built, it does this step itself.

---

## The recursive loop

R5–R7 are the stages of the recursive self-development scheme described in
[`../SELF-DEVELOPMENT.md`](../SELF-DEVELOPMENT.md). Once `core-retro` exists, R5 is `/core-retro log`
and R6 is `/core-retro review`, followed by `/core-skill-authoring revise` and `/core-skill-evals`.
Everything is user-invoked. The seven safety rules there apply to every stage, especially "no
self-grading" for the four self-development skills.

## R6. Revision (after 3 field uses, or after any miss)

**Prompt:**

```text
Revise the skill <name>. Read its SKILL.md, references/, TRIALS.md (all field entries) and
MISSES.md lines that mention it. For each "missed" entry decide: add a step, add a decision rule,
add an anti-pattern, sharpen the description, or no change (say why). Make the smallest edit that
covers the evidence. Then run R1, R2 and R3 again (use the most recent field task as the new trial).
Bump CHANGELOG.md: minor version for new steps or rules, patch for wording. Status:
- "stable" if the last 3 field uses had no miss and R1–R3 pass;
- otherwise keep the current status.
Report what changed, linked to the entries that caused it.
```

## R7. Regression rule

A change to any skill re-runs R1 and R3 for that skill, and R2 for every skill in the same catalog
group, because descriptions compete. A change to `.muse/project.json`'s schema re-runs R3 for every
core skill that reads the changed keys.

*Supplement:* Muse's docs and defaults change between versions. After a Muse update (when
`muse --version` changes), re-run the trials and any fixtures for the P1 skills, and update
VERIFIED.md.
