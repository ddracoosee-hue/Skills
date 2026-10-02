# skills

Shared skills for Meta Muse Code. One clone serves every project on this PC. Muse runs in
PowerShell here.

- **What to build:** the planned skills, their priorities and the anatomy every skill follows are in
  [SKILLS-CATALOG.md](SKILLS-CATALOG.md).
- **How to build:** to build them with Muse, start at [prompts/README.md](prompts/README.md).

> This repository is **public**. Skills must be safe to publish: no secrets, private text or
> personal paths. The pre-commit scan enforces this. To make the repo private, go to GitHub →
> Settings → General → Danger Zone → Change visibility.

## Layout

```
skills/
  core-project-profile/SKILL.md   # reads <project>/.muse/project.json
  core-<name>/SKILL.md            # project-neutral skills
  textclone-<name>/SKILL.md       # Textclone pack
  orion-<name>/SKILL.md           # Orion pack
templates/SKILL.template.md       # the eight-section skeleton every skill starts from
prompts/                          # one Muse build prompt per skill, the build protocol, refinement
tools/check-skills.mjs            # structure and privacy check every skill must pass (stage R1)
install.ps1                       # links each skill into ~\.agents\skills
SKILLS-CATALOG.md                 # the 117 planned skills
```

Supplemental files, used where they help and never as the structure:

```
docs/MUSE-REFERENCE.md   Muse Code facts and techniques (adapted for PowerShell)
VERIFIED.md              Muse facts to confirm on this PC before a skill relies on them
LANES.md                 which Muse tier (Standard or Contributor) may see which project
EVALS.csv                scores from optional fixture runs
.githooks/pre-commit     secret and personal-path scan
```

Each skill is a folder with a `SKILL.md`: YAML frontmatter (`name`, `description`), then the
instructions. The folder name and `name:` must match.

## Naming

- `core-*` works in any project. It reads project facts from `.muse/project.json`, never
  hard-coded paths.
- `<project>-*` belongs to one project.
- Never reuse a bundled Muse name: `plan`, `grill`, `grilling`, `grill-with-docs`, `taste`,
  `threejs`, `migrate`.

## Install (PowerShell)

```powershell
git clone https://github.com/ddracoosee-hue/Skills.git $HOME\muse-skills
powershell -ExecutionPolicy Bypass -File $HOME\muse-skills\install.ps1
```

The installer links each skill separately into `~\.agents\skills\<name>`, so other skills can
live alongside them. It never overwrites a real folder, and it turns on the pre-commit scan. If you
ran the first version (one link for the whole folder), it replaces that link.

Restart Muse, then run `/skills` (or `muse skills list`). The installed skills should be listed.

## Rules

- No personal texts, databases, `.env` values, tokens or logs in any skill.
- A change to a skill is a commit here, not an edit inside a project.
