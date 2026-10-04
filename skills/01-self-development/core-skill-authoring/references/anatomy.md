# Anatomy: the eight sections

Every SKILL.md has YAML frontmatter (`name`, `description`) plus these eight
sections in this order. The example below is a fictional skill, synthetic.

## Frontmatter

```yaml
---
name: core-example-lint
description: Use when linting the project before a commit, to list violations by file and line. Not for fixing violations (use `core-example-fix`).
---
```

Use unique top-level `name` and `description` fields with single-line string
values. Quote a description containing `: ` or ` #` so YAML keeps it as text.
Double-quoted strings use JSON-compatible escaping; in single-quoted strings,
write an apostrophe twice. The 250-character limit counts the decoded value.

## 1. Use when

3–6 bullets with the words a user would type. Always end with:

- Invoke as /core-example-lint.
- Instructions in the prompt or the project's AGENTS.md override this skill.

## 2. Not for

Near-misses, each pointing at the skill that handles it:

- Fixing violations → core-example-fix
- Formatting whole files → none

## 3. Inputs

What the skill needs. Core skills name `.muse/project.json` keys:

- `.muse/project.json`: commands.lint_py. If the file is missing, ask for /core-project-profile and stop.
- The task scope: which folders are in bounds.

## 4. Steps

Numbered. Every step ends with `Done when:` and a checkable condition:

1. Run the lint command from project.json. Done when: the exit code is recorded.
2. Group violations by file and line. Done when: each row names file:line and the rule.
3. Run the project's real check for anything changed. Done when: pass or fail is recorded.

## 5. Decision rules

Judgement calls as If-then, with stop-and-ask moments:

- If a violation sits outside the task scope, then list it under Open questions instead of fixing it.
- Before any change outside the task scope, ask exactly: "Approve, request changes, or cancel?"

## 6. Anti-patterns

The specific mistakes this skill prevents, one line each:

- Fixing violations the task did not ask about.
- Claiming success because the turn finished, without the check result.

## 7. Evidence to report

What the final message must show:

- Commands run with exit codes, the violation table, and anything not verified and why.

## 8. References

Links to references/ files, sources for every project fact, and related skills:

- [references/rules.md](references/rules.md): the rule list with examples.
- Related: core-example-fix.
- Sources: lint config (pyproject.toml), scope (tasks.md §G4).

## Supplemental rules (protocol §8)

- Commands are PowerShell: `npm.cmd`, `.venv\Scripts\python.exe`, `Get-FileHash`.
- Steps name exact commands, not concepts.
- A skill that pauses saves progress to `.agents\state\<name>.json` and ends
  with `Re-invoke: /<name> continue`.
- Approval questions use exactly "Approve, request changes, or cancel?".
  A project's own approval phrase wins. One question at a time, recommended first.
- No dates, counters, or run-specific text in SKILL.md. Versions live in CHANGELOG.md.
- `references/` loads only when a step asks: write "If …, read references/x.md".
- Any change is followed by the project's real check, and its result is reported.
- Skill text is safe to publish: no secrets, private text, or personal paths.
- Frontmatter holds only `name` and `description`.
