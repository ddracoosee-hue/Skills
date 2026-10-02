# skills

Private, shared skills for Meta Muse Code. One clone serves every project on this PC.
The planned skills, their priorities and the anatomy every skill follows are in
[SKILLS-CATALOG.md](SKILLS-CATALOG.md). To build them with Muse, start at
[prompts/README.md](prompts/README.md).

## Layout

```
skills/
  core-project-profile/SKILL.md   # reads <project>/.muse/project.json
  core-<name>/SKILL.md            # project-neutral skills
  textclone-<name>/SKILL.md       # Textclone pack
  orion-<name>/SKILL.md           # Orion pack
install.ps1                       # links skills/ into ~/.agents/skills
SKILLS-CATALOG.md                 # the planned list of 115 skills
prompts/                          # one Muse build prompt per skill, the build protocol, refinement
tools/check-skills.mjs            # structure check every skill must pass (refinement stage R1)
```

Each skill is a folder with a `SKILL.md`: YAML frontmatter (`name`, `description`), then the instructions.
The folder name and `name:` must match.

## Naming

- `core-*` works in any project. It reads project facts from `.muse/project.json`, never hard-coded paths.
- `<project>-*` belongs to one project.
- Never reuse a bundled Muse name: `plan`, `grill`, `taste`, `threejs`.

## Install (Windows)

```powershell
git clone https://github.com/ddracoosee-hue/skills.git $HOME\muse-skills
powershell -ExecutionPolicy Bypass -File $HOME\muse-skills\install.ps1
```

Restart Muse, then run `/skills`. The installed skills should be listed.

## Rules

- No personal texts, databases, `.env` values, tokens or logs in any skill.
- A change to a skill is a commit here, not an edit inside a project.
