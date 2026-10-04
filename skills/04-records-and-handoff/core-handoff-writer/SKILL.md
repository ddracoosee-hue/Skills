---
name: core-handoff-writer
description: "Use when updating the project's handoff file after meaningful work or before stopping: dated scope, files, checks, findings, limits, next action. Not for the chat report (use `core-report-writer`) or a Codex review request (use `core-codex-handoff`)."
---
# core-handoff-writer

## Use when
- Update the handoff before you stop.
- Record today's work in the handoff.
- Leave notes so the next session can pick up.
- Log what you changed and what's left.
- Invoke as /core-handoff-writer.
- Instructions in the prompt or AGENTS.md override this skill.

## Not for
- Telling the user what you did → core-report-writer
- Asking Codex to review → core-codex-handoff
- Ticking roadmap steps → core-roadmap-sync

## Inputs
- `.muse/project.json`: `paths.handoff`. If the file is missing, ask for /core-project-profile and stop.
- The work to record: scope, files, checks, findings, limits, next action.
- For a review handoff: intended behavior, uncertainties, areas to inspect, the commit or uncommitted diff.

## Steps
1. Re-read `paths.handoff` right before editing. Keep every unresolved note from other agents. Done when: the latest handoff was read and no foreign note is missing.
2. Add a dated section: `## <agent> <topic> (YYYY-MM-DD)`. Done when: the new section exists with today's date.
3. Write: scope; branch, worktree and commit (or "uncommitted diff of <files>"); files changed; checks with exact results; findings; limits; next action. Done when: all seven items are present.
4. List completed changes and proposals in separate lists. Done when: no proposal sits in the completed list and vice versa.
5. Run `git diff` on the handoff. Done when: the diff shows only your new section.

## Decision rules
- If you have no evidence an agent received, read, or approved something, then never claim they did.
- If another agent's notes exist, then never delete them.
- If content is personal data, then it never goes in the handoff.

## Anti-patterns
- Rewriting history in old sections.
- "All tests pass" without the command.
- Vague next steps.

## Evidence to report
- The section added.
- The diff showing only it changed.
- Anything not verified and why.

## References
- Related: core-report-writer, core-codex-handoff, core-session-start.
- Sources: section style (textclone docs/AI_HANDOFF.md); multi-agent rules (textclone AGENTS.md "Working with another assistant"); review-handoff contents (textclone CLAUDE.md); profile keys (core-project-profile references/schema.md).
