# Trials: core-repo-bootstrap

## Trials

- 2026-10-04 | B trial: Glimber synthetic one-line-README bootstrap, 5/5 synthetic answers, 9 files on muse/bootstrap 091af70, profile handoff minimal (uncommitted, parses) | steps 1-5 met (boilerplate caveats); improvised 14, wrong 1 (gitignore backslashes), anti-patterns avoided 4 | verdict: pass with gaps | trial area trials/b-core-repo-bootstrap/trial kept for review; skills repo untouched except TRIALS.md; synthetic data only.

### 2026-10-04 B-trial detail (synthetic Glimber, Lane A)

Method: empty trial folder seeded with one-line `# Glimber` README; 5 synthetic answers (purpose/stack/where-runs/must-never/lane A); 9 step-3 files drafted from answers; gate Approved (synthetic, with README-expand permission); committed on `muse/bootstrap`; minimal `/core-project-profile` handoff (direct `.muse/project.json`, validated, left uncommitted). No private data; synthetic git identity `Glimber Trial` plus a synthetic .invalid address (redacted: literal address trips the email scan).

| Step | Done-when met? | Evidence | Clear / wrong / missing? |
| --- | --- | --- | --- |
| 1 | yes | `git -C <trial> ls-files` exit 128 (not a git repo); checklist `README.md exists=True`, 8 others `False`; `Get-Content README.md` = `# Glimber`; inventory in trial log; command exit 0 | Clear intent. Missing: non-git handling; where to write inventory; CI path (used `.github/workflows/ci.yml` from References); granularity for partial README. |
| 2 | yes | `trial/.agents/state/core-repo-bootstrap.json` parses; 5 `answered`/0 open; note contains `Re-invoke: /core-repo-bootstrap continue`; write command exit 0 | Missing: JSON schema; exact question wording (invented from topics); single-turn compression of one-question-at-a-time; run-commands not asked but required in step 3 (folded lint/test/run into stack answer). |
| 3 | yes (boilerplate caveat) | Trace check exit 0: README purpose `True` + 3 `python -m` cmds; `AGENTS.md` 3 `^Never `; `SPEC.md` `^A$` `True`; `PLAN.md` 2 `Done when:`; `DECISIONS.md` 4 `^## D`; `HANDOFF.md` `docs/PLAN.md M1-M2` `True`; `.gitignore` 6 entries; `LANES.md` `Lane: A` `True`; `ci.yml` 2 `python -m` runs; full contents dumped | Missing: CI path; boilerplate-vs-invention rule (action versions, job names, headings, template lines, trace annotations); draft-vs-write timing; LANES template inline; `microcoin AGENTS.md` unavailable. Wrong: `.gitignore` backslash entries (used forward slashes). |
| 4 | yes | Showed 9 planned files; exact quote `Approve, request changes, or cancel?`; synthetic `Approve` with README-expand permission; recorded as state-JSON `gate_decision: "Approve (synthetic 2026-10-04; ...)"`; command exit 0 | Clear question. Missing: record location (used state JSON); whether approval covers README overwrite (folded in); how to know project's own phrase when bootstrapping. |
| 5 | yes | `git init` exit 0; `checkout -b muse/bootstrap` exit 0; `commit` exit 0 `091af70` 9 files 126 insertions; `ls-files` exit 0 count 9; `.muse/project.json` parses (`Glimber`/`.`/`powershell`/`A`), 15 top keys + 9 command keys, no absolute/personal-path match (`False`=good); `status` only `?? .muse/` | Missing: `init` when not a repo; identity/message/push policy; profile scope in confined trial (skipped worktree, direct write, left uncommitted per profile no-commit default); minimal vs full `validation.md` checks. |

(1) Improvised because the skill did not say (14):

- `git init` + synthetic identity + commit message wording.
- State-JSON shape (`questions[]`/`open_questions[]`/`gate_decision`) and exact question wording.
- Single-turn compression of 5 one-question turns + `Re-invoke` in JSON note.
- Run/lint/test commands folded into stack answer (step 2 lacks run-commands question).
- CI path `.github/workflows/ci.yml` from References.
- `.gitignore` forward slashes (skill lists backslashes).
- `LANES.md` body from workspace template.
- `AGENTS.md` short-rules style without `microcoin AGENTS.md`.
- `Traces to:` annotations in `PLAN.md`/`DECISIONS.md` for trial verification.
- CI boilerplate (`checkout@v4`, `setup-python@v5`, `on: [push, pull_request]`, job `lint-test`, `name: ci`, `runs-on: windows-latest` matched to where-runs).
- Draft-in-memory then write-on-approval (skill ambiguous on draft-vs-write).
- Gate record location (state JSON) + README-overwrite permission folded into approval.
- Profile handoff: direct `.muse/project.json` in trial (skipped `../*-wt` worktree to stay in trial), left uncommitted, minimal validation (parse + keys + no-personal-paths).
- Kept `# Glimber` heading when expanding README (keep-and-draft-around).

(2) Wrong for this project (1):

- `.gitignore` entries `.agents\runs`, `.agents\state` use backslashes; git needs forward slashes (`.agents/runs`, `.agents/state`). Used forward slashes; `check-ignore` confirms `core-repo-bootstrap.json` ignored. No other instruction was wrong; the rest were missing/unclear, not incorrect.

(3) Anti-patterns nearly committed (4):

- Copying Microcoin product rules: nearly added generic collector/spending-style rules to look complete; stopped, wrote only Glimber answers + plain `Never …` lines.
- Boilerplate docs: nearly added architecture/API/roadmap sections to SPEC/PLAN; kept to purpose/stack/runtime/constraints + 2 milestones.
- Code before spec: nearly scaffolded `glimber/__init__.py` to smoke-test run commands; stopped (bootstrap is docs/config only).
- Claiming success on turn end: nearly reported done after writes; ran trace check, `git status`/`ls-files`, JSON parse + key + no-personal-path checks first.

Trace note: 9/9 files contain verbatim answer phrases (see evidence); residual non-answer text is skill-prescribed paths, template lines, markdown structure, and CI boilerplate noted above. State JSON (`trial/.agents/state/core-repo-bootstrap.json`) and profile (`trial/.muse/project.json`, untracked) are synthetic-only. No `CHANGELOG.md` change from inside trial.

- 2026-10-04 | B trial rerun: Glimber synthetic one-line-README bootstrap, 5/5 synthetic answers, 9 files on muse/bootstrap bbea77b, profile handoff minimal (uncommitted, parses) | steps 1-5 met (boilerplate caveats); improvised 14, wrong 0 (gitignore forward-slash fix verified), anti-patterns avoided 4 | verdict: pass with gaps | trial area trials/b-core-repo-bootstrap/trial kept for review; skills repo untouched except TRIALS.md; synthetic data only.

### 2026-10-04 B-trial rerun detail (synthetic Glimber, Lane A)

Method: empty trial folder seeded with one-line `# Glimber` README; 5 synthetic answers (purpose/stack/where-runs/must-never/lane A); 9 step-3 files drafted from answers; gate Approved (synthetic, with README-expand permission); committed on `muse/bootstrap`; minimal `/core-project-profile` handoff (direct `.muse/project.json`, validated, left uncommitted). No private data; synthetic git identity `Glimber Trial` plus a synthetic .invalid address (literal address redacted to avoid email scan).

| Step | Done-when met? | Evidence | Clear / wrong / missing? |
| --- | --- | --- | --- |
| 1 | yes | `git -C <trial> ls-files` exit 128 (not a git repo); `README.md exists=True`, 8 others `False`; `Get-Content README.md` = `# Glimber`; inventory `trial/.agents/state/inventory.md` write exit 0 | Clear intent. Missing: non-git handling; inventory location; CI path (used `.github/workflows/ci.yml` from References); partial-README granularity. |
| 2 | yes | `trial/.agents/state/core-repo-bootstrap.json` parses; 5 answered/0 open; note contains `Re-invoke: /core-repo-bootstrap continue`; ConvertFrom-Json exit 0 | Missing: JSON schema; exact question wording (invented, recommended first); single-turn compression of one-question-at-a-time; run-commands folded into stack answer (step 2 lacks run-commands question). |
| 3 | yes (boilerplate caveat) | Trace exit 0: README purpose `True` + 3 `python -m` + head `True`; `AGENTS.md` 3 `^Never `; `SPEC.md` purpose `True`; `PLAN.md` 2 `Done when:`; `DECISIONS.md` 4 `^## D`; `HANDOFF.md` `docs/PLAN.md M1-M2` `True`; `.gitignore` 6 lines; `LANES.md` `Lane: A` `True` + purpose `True`; `ci.yml` 2 `python -m` + windows-latest `True`; contents dumped exit 0 | Missing: CI path; boilerplate-vs-invention rule (action versions, job names, headings, labels, template lines, `.gitignore` skill-prescribed); draft-vs-write timing (wrote drafts in step 3 to verify before gate); LANES template inline; `microcoin AGENTS.md` unavailable. Not wrong: `.gitignore` forward slashes verified (hex 2F), previous backslash report fixed. |
| 4 | yes | Showed 9 files + full contents exit 0; exact quote `Approve, request changes, or cancel?`; synthetic `Approve (synthetic 2026-10-04; README-expand permission included; 9 files shown)` in state-JSON `gate_decision`; write exit 0 | Clear question. Missing: record location (used state JSON); README-overwrite coverage (folded in); project's own phrase when bootstrapping (used default). |
| 5 | yes | `git init` exit 0; `checkout -b muse/bootstrap` exit 0; `add` 9 explicit paths exit 0; `commit` exit 0 `bbea77b` 9 files 118 insertions; `ls-files` exit 0 count 9; `branch --show-current` = `muse/bootstrap`; `.muse/project.json` parses (`Glimber`/`.`/`powershell`/`A`), 15 top + 9 cmd keys, no-abs-path `False`=good, no-email `False`=good; `status` only `?? .muse/`; `check-ignore` exit 0 via `.gitignore:5:.agents/state` | Missing: identity/message/push policy (synthetic local identity, synthetic message, no push); profile worktree skip (direct write, left uncommitted per profile no-commit default, to stay in trial); minimal vs full `validation.md` checks. Clear: `init` when not a repo. |

(1) Improvised because the skill did not say (14):

- State-JSON shape (`questions[]`/`open_questions[]`/`gate_decision`) and exact question wording (recommended first).
- Single-turn compression of 5 one-question turns + `Re-invoke` in JSON note.
- Run/lint/test folded into stack answer (step 2 lacks run-commands question).
- Inventory location (`trial/.agents/state/inventory.md`, uncommitted).
- CI path `.github/workflows/ci.yml` from References.
- `LANES.md` body from workspace template.
- `AGENTS.md` short-rules style without `microcoin AGENTS.md`.
- Draft = write to disk in step 3 to verify trace before gate (cancel would leave files).
- Gate record location (state JSON) + README-expand permission folded into approval.
- Project's own approval phrase handling (used default; no project yet).
- `git init` + synthetic identity + commit message wording + no-push.
- Profile handoff: direct `.muse/project.json` in trial (skipped worktree to stay in trial), left uncommitted, minimal validation (parse + keys + no-personal-paths).
- Kept `# Glimber` heading when expanding README (keep-and-draft-around).
- CI boilerplate (`checkout@v4`, `setup-python@v5`, `on: [push, pull_request]`, job `lint-test`, `name: ci`, `runs-on: windows-latest` matched to where-runs) + M1/M2 split + `Never` capitalization.

(2) Wrong for this project (0):

- None. `.gitignore` forward slashes verified (hex `2F`); previous backslash report no longer applies. No other instruction was wrong; the rest were missing/unclear, not incorrect.

(3) Anti-patterns nearly committed (4):

- Copying Microcoin product rules: nearly added generic collector/spending-style rules to look complete; stopped, wrote only Glimber answers + plain `Never …` lines.
- Boilerplate docs: nearly added architecture/API/roadmap sections to SPEC/PLAN; kept to purpose/stack/runtime/constraints + 2 milestones.
- Code before spec: nearly scaffolded `glimber/__init__.py` to smoke-test run commands; stopped (bootstrap is docs/config only).
- Claiming success on turn end: nearly reported done after writes; ran trace check, `git status`/`ls-files`, JSON parse + key + no-personal-path checks first.

Trace note: 8/9 files contain verbatim answer phrases (see evidence); `.gitignore` is skill-prescribed (6 entries, forward slashes, `check-ignore` confirms state JSON ignored). Residual non-answer text is skill-prescribed paths, template lines, markdown structure, and CI boilerplate noted above. State JSON (`trial/.agents/state/core-repo-bootstrap.json`) and profile (`trial/.muse/project.json`, untracked) are synthetic-only. No `CHANGELOG.md` change from inside trial.
