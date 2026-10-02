# skills

Shared skills for Meta Muse Code. One clone serves every project on this PC. Muse runs in
PowerShell here.

**Where to look:**

| You want to… | Open |
| --- | --- |
| Find the right skill to call, and what it pairs with | [SKILLS-MAP.md](SKILLS-MAP.md): every skill by function |
| Browse skills on GitHub | [`skills/`](skills/): one folder per function, each with its own README |
| See how skills improve themselves | [SELF-DEVELOPMENT.md](SELF-DEVELOPMENT.md): the recursive loop and its safety rules |
| See which projects the skills serve | [PROJECTS.md](PROJECTS.md) and [LESSONS.md](LESSONS.md) |
| Understand large vs small skills, and what to build next | [SKILL-ARCHITECTURE.md](SKILL-ARCHITECTURE.md) |
| Rank your projects from your PC | [prompts/07-local-portfolio-survey.md](prompts/07-local-portfolio-survey.md) (run in Muse) |
| See the full plan with priorities | [SKILLS-CATALOG.md](SKILLS-CATALOG.md) |
| Build skills with Muse | [prompts/README.md](prompts/README.md) |

> This repository is **public**. Skills must be safe to publish: no secrets, private text or
> personal paths. The pre-commit scan enforces this. To make the repo private, go to GitHub →
> Settings → General → Danger Zone → Change visibility.

## Layout

```
skills/
  01-self-development/            # one folder per function (13), each with a generated README
    core-skill-authoring/SKILL.md # one folder per skill; called in Muse as /core-skill-authoring
  02-session-and-workflow/
  …
  13-flows/
skills-map.json                   # which function each skill belongs to (edit this)
SKILLS-MAP.md                     # generated map: what to call, pairs with, instead use
tools/skill-map.mjs               # regenerates SKILLS-MAP.md and the folder READMEs
templates/SKILL.template.md       # the eight-section skeleton every skill starts from
prompts/                          # one Muse build prompt per skill, the build protocol, refinement
tools/check-skills.mjs            # structure and privacy check every skill must pass (stage R1)
install.ps1                       # links each skill into ~\.agents\skills
SKILLS-CATALOG.md                 # the 128 planned skills
```

Self-development and portfolio files:

```
SELF-DEVELOPMENT.md      the recursive loop: use → log → review → revise → test, always user-invoked
LESSONS.md               lessons proven across two or more projects
PROJECTS.md              every project the skills serve
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
live alongside them. The function folders exist only in the repo: Muse sees one flat list, and you
call every skill by name. It never overwrites a real folder, and it turns on the pre-commit scan. If you
ran the first version (one link for the whole folder), it replaces that link.

Restart Muse, then run `/skills` (or `muse skills list`). The installed skills should be listed.

## Rules

- No personal texts, databases, `.env` values, tokens or logs in any skill.
- A change to a skill is a commit here, not an edit inside a project.
