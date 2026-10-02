# Build protocol: rules for building every skill

Every skill prompt in this folder begins with "Follow `prompts/00-BUILD-PROTOCOL.md`". This file is
those rules. Read it once per session, before the first skill. When a skill prompt and this file
disagree, this file wins. A project's `AGENTS.md` still wins over both inside that project.

## 1. Where you work

| Place | Path | What you may do |
| --- | --- | --- |
| Live skills clone | `C:\Users\ddrac\muse-skills` (branch `main`, linked to `~\.agents\skills`) | Read only. Never edit it, switch its branch, or commit in it. Every Muse session loads skills from here. |
| Batch worktree | `C:\Users\ddrac\muse-skills-wt\<batch>` on branch `muse/skills-<batch>` | All skill writing happens here. Drafts stay invisible to other projects until the user merges them. |
| Textclone | `C:\Users\ddrac\textclone` | Source material only. Read files; never edit, run migrations, or open `data\textclone.db`. The single exception is `core-project-profile`; its prompt says exactly what it may write. |
| Orion | `C:\Users\ddrac\orion` | Source material only, as above. |
| Trials | `C:\Users\ddrac\muse-skills-wt\trials\<skill>` or a project worktree | The only places you may run a trial (see `01-REFINEMENT.md`). Delete a trial folder when the trial is recorded. |

Create the batch worktree once per batch:

```powershell
git -C C:\Users\ddrac\muse-skills fetch origin
git -C C:\Users\ddrac\muse-skills worktree add C:\Users\ddrac\muse-skills-wt\<batch> -b muse/skills-<batch> origin/main
```

Never push. Never merge. The user reviews the batch branch and merges it.

## 2. What one skill folder contains

```
skills/<name>/
  SKILL.md        frontmatter + the eight sections below, 150 lines or fewer (hard limit 200)
  evals.md        trigger tests (format in 01-REFINEMENT.md, stage R2)
  CHANGELOG.md    "## 0.1.0 — YYYY-MM-DD — draft" plus one line on what the version does
  TRIALS.md       trial and field-use records (stage R3 onwards); no private data
  references/     long material: checklists, tables, worked examples, command blocks
```

### SKILL.md frontmatter

```yaml
---
name: <name, identical to the folder name>
description: <the description given in the prompt, verbatim>
---
```

Only `name` and `description`. Muse decides when to use a skill by reading the description, so it is
the most important line in the file. Change it only when stage R2 fails, and record why in
`CHANGELOG.md`.

### SKILL.md sections, in this order

1. `## Use when`: the situations, as 3–6 bullets, with the words a user would actually type.
2. `## Not for`: the near-misses, each pointing to the skill that handles it (`→ core-x`).
3. `## Inputs`: what the skill needs. Core skills name `.muse/project.json` keys (for example
   `commands.test_unit`); project skills may cite exact project paths.
4. `## Steps`: numbered. Every step ends with `Done when:` and a condition that can be checked, such as
   a command's exit code, a file that exists, or a line in the report.
5. `## Decision rules`: the judgement calls, written as `If …, then …`. Include when to stop and ask.
6. `## Anti-patterns`: the specific mistakes this skill exists to prevent, one line each.
7. `## Evidence to report`: what the final message must show (commands, exit codes, file paths, what
   could not be checked and why).
8. `## References`: links to `references/*.md`, and for every project fact the source file it came
   from (for example `textclone: tasks.md §G4`).

## 3. Writing rules

- **Plain, imperative sentences, one instruction per line.** The user reads these with dyslexia. Use
  short lines, no walls of text, and the same word for the same thing throughout.
- **No invented facts.** Every path, command, port, rule or number comes from a file you opened in
  this session. Before you write a fact, check the file exists and says that. If a source is missing
  or contradicts the prompt, stop and report it; never fill the gap from memory.
- **Core skills are portable.** No Textclone or Orion path, port or command inside a `core-*` skill;
  read them from `.muse/project.json`, using the key names in
  `skills/core-project-profile/references/schema.md`. Project examples may appear in `references/`
  when they are labelled as examples.
- **Privacy.** No personal text, corpus content, database rows, `.env` values, tokens, emails or log
  excerpts in any file. Use synthetic examples.
- **No overlap.** Before writing, read the descriptions of every skill already in `skills/`. If your
  skill's job is already covered, stop and report the overlap instead of building a duplicate.
- **Names.** Never use `plan`, `grill`, `taste` or `threejs` (Muse's bundled skills), and never reuse
  an existing skill's name.

## 4. The build sequence for every skill

1. Read: this file, `01-REFINEMENT.md`, `SKILLS-CATALOG.md` §1, the skill's prompt, every skill the
   prompt says to build after, and every source the prompt lists. Done when: you can name the source
   file for each project fact you will write.
2. Write the folder (section 2). Done when: `SKILL.md`, `evals.md`, `CHANGELOG.md` and any
   `references/` files the prompt lists exist (`TRIALS.md` is created in step 4).
3. Run `node tools/check-skills.mjs skills/<name>`. Done when: exit 0. Read every warning, and fix any
   description overlap it reports.
4. Run stage R2 (trigger check) and stage R3 (trial) from `01-REFINEMENT.md`. Done when: both are
   recorded and passed, or 3 fix cycles are used up (then report and stop).
5. Commit only that skill's folder:
   `git add skills/<name>` then `git commit -m "Add skill <name> (draft)"`. Done when: `git status`
   shows nothing else staged.
6. Report (section 5). Done when: the report is sent.

One skill per user message, unless the user writes otherwise.

## 5. The report after each skill

```
Skill: <name>  (status: draft | tested)
Folder: skills/<name>/  SKILL.md lines: <n>
Description: <verbatim>
Checker: <exit code and summary line>
R2 trigger check: <T passed>/<T total>, <N passed>/<N total>  (rounds used: <n>)
R3 trial: <pass | fail> — <one line>; record in TRIALS.md
Sources used: <files>
Open questions / anything not verified: <list or "none">
Commit: <hash>
```

## 6. When a prompt mentions a skill that isn't built yet

- **Hard dependency** (the prompt says "Build after X", or a flow's chain step has no "only if" or
  "or"): stop and report that X must be built first. The batch order in `prompts/README.md`
  avoids this.
- **Soft mention** (a step says "via X", "(X when built)", "only if", or offers X as one option):
  do that step directly using the sources listed, and note it under "Open questions" in the report.
  Once X exists, `core-skill-maintenance` updates the reference.

## 7. Stop conditions (report, then wait)

- A source the prompt names is missing, renamed, or says something different.
- The skill would need you to change a project file (other than the one exception above).
- The description cannot be made distinct from an existing skill within 3 R2 rounds.
- A trial needs the live database, the personal corpus, Ollama on the live ports, or the network.
- 3 fix cycles on one stage did not pass.
