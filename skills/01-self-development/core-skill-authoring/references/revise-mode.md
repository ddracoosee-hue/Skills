# Revise mode: /core-skill-authoring revise <skill>

Revise mode applies proposals the user already approved (usually from
/core-retro review). It never invents its own edits.

## Procedure

1. Read the approved proposals with their evidence ids. Done when: each proposal names its TRIALS.md or MISSES.md entries.
2. Read the skill's SKILL.md, references/, evals.md, TRIALS.md, and the MISSES.md lines that mention it. Done when: every proposal is matched to the lines it changes.
3. Apply only the approved proposals. Make the smallest edit that covers the evidence. Done when: no unapproved change exists in the diff.
4. Add the trial or eval case that would have caught the miss. Done when: the new case fails on the old text and passes on the new text.
5. Record lineage. Every change gets a CHANGELOG.md line "Because: <TRIALS.md / MISSES.md entry ids>". Done when: each changed section traces to evidence.
6. Bump the version: minor for new steps or rules, patch for wording. Start the new entry as draft; preserve earlier versions and their evidence. Done when: CHANGELOG.md carries a new draft entry with the pending checks listed.
7. Hand over to /core-skill-evals. Done when: R1–R3 records exist for the new version.

## Recursion rules (SELF-DEVELOPMENT.md §3)

These apply to every revision. The previous-stable-evaluator rule specifically
protects self-development skills (core-skill-authoring, core-skill-evals,
core-skill-maintenance, core-retro):

1. No self-grading. Test the new version with the previous stable version of
   core-skill-evals and the checker from its git tag, never with itself.
2. Evidence threshold. One failure is logged; the same failure twice proposes
   an edit. A single failure suffices only after harm or a privacy leak.
3. Tests only grow. Never edit or remove test lines to make a skill pass.
4. One level at a time. A batch changes either a self-development skill or the
   skills it governs, never both.
5. Lineage. Every change cites its evidence as a Because: line.
6. Rollback. Every release gets tag skill/<name>/v<x.y.z>; a worse revision
   is restored from the last stable tag.
7. Human gate. The user approves every proposal, lesson, and merge.
