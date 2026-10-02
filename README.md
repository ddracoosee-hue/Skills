# skills

Shared, traceable skills for Meta Muse Code (they also follow the cross-agent SKILL.md format that
Claude Code and Codex read). One clone serves every project on this PC.

**Start here:**
1. [`docs/MUSE-REFERENCE.md`](docs/MUSE-REFERENCE.md): the facts and design rules.
2. [`VERIFIED.md`](VERIFIED.md): what has been checked on this machine.
3. [`prompts/README.md`](prompts/README.md): how to build the skills with Muse.

> This repository is **public**. Every file must be safe to publish: no secrets, private text or
> personal paths in skills. The pre-commit scan enforces this for `skills/` and `templates/`. To
> make the repo private, go to GitHub → Settings → General → Danger Zone → Change visibility.

## Layout

```
skills/<name>/          one folder per skill (SKILL.md, evals.md, CHANGELOG.md, TRIALS.md,
                        references/, scripts/, fixtures/)
templates/              SKILL.template.md: the nine-section skeleton every skill starts from
prompts/                one Muse build prompt per skill, the build protocol, the refinement loop,
                        and environment and tool prompts
tools/check_skills.py   structure and privacy check (refinement stage R1); stdlib Python
tools/run_fixture.*     headless fixture harness (built by prompt E1 after Phase 0)
tools/trace_ledger.py   one row per skill run from exports and run files (built by prompt E3)
docs/MUSE-REFERENCE.md  the Muse Code reference this library is built on
VERIFIED.md             Muse facts checked on this machine; skills may rely only on these
LANES.md                which Muse tier (Standard or Contributor) may see what
EVALS.csv               the scorecard: fixture pass rates per skill version
SKILLS-CATALOG.md       the 117 planned skills
install.ps1             links each skill into ~\.agents\skills (Muse native on Windows)
install.sh              the same for Muse in WSL, Linux or macOS
.githooks/pre-commit    secret and personal-path scan, plus the structure check on changed skills
```

## Naming

- `core-*` skills work in any project. They read project facts from `.muse/project.json`, never
  from hard-coded paths.
- `<project>-*` skills (`textclone-*`, `orion-*`) belong to one project.
- Never reuse a bundled Muse name: `plan`, `grill`, `grilling`, `grill-with-docs`, `taste`,
  `threejs`, `migrate`.

## Install

**Muse running natively on Windows** (the default since 2026-09-16; check VERIFIED.md #1):

```powershell
git clone https://github.com/ddracoosee-hue/Skills.git $HOME\muse-skills
powershell -ExecutionPolicy Bypass -File $HOME\muse-skills\install.ps1
```

**Muse running in WSL:** run this inside WSL, and keep the clone on the Linux filesystem:

```bash
git clone https://github.com/ddracoosee-hue/Skills.git ~/src/muse-skills
~/src/muse-skills/install.sh
```

Both installers link each skill separately into `~/.agents/skills/<name>`, so other user skills
can live alongside them. They never overwrite a real folder, and they enable the pre-commit scan.
If you ran the first version of `install.ps1` (one link for the whole folder), the new one replaces
that link. Restart Muse, then run `muse skills list`.

## Rules

- **Lanes:** author and revise skills on Lane A (Standard). Textclone, Orion and the manuscript are
  Lane A only. See `LANES.md`.
- **Edits:** a change to a skill is a commit here (branch, checks, fixtures, EVALS.csv, merge).
  Never edit a skill inside a project.
- **Facts:** no Muse feature may be used until `VERIFIED.md` confirms it on this machine.
