# R4 cross-review: batch core-session

Reviewer: Claude Code (independent of the Muse sessions that wrote these skills).
Scope: branch `muse/skills-core-session` after merging `muse/skills-core-session-b`
(merge `401358c`), plus the installer test fix `0943b12`. All 12 batch skills were read
against their changelogs, evals, trials and the profile schema. Read-only review; the
fixes below are for Muse to apply per `prompts/01-REFINEMENT.md` R4.

Checks at review time: `node tools/check-skills.mjs` 15 skills, 0 errors, 0 warnings;
`node tools/skill-map.mjs --check` up to date; `node tests/run.mjs` 70 passed.

## Findings, most severe first

| ID | Severity | Skill | Finding | Required fix |
| --- | --- | --- | --- | --- |
| R4-1 | P1 | 8 session skills | All 0.1.0 entries for core-session-start, core-worktree, core-recheck-loop, core-commit, core-phase-gate, core-escalation, core-long-run and core-handoff-writer read "tested" and claim "bootstrap review by user". No stable evaluator tag exists, and no user acceptance is recorded in TRIALS.md or the build session log. | Follow the user's status decision in the fix prompt. Without recorded acceptance the heading is "draft" and the text says "bootstrap review required". |
| R4-2 | P1 | core-recheck-loop | `SKILL.md:27,30` and `references/loop-script.md:10`: with `recheck.consecutive_passes` null (the shipped orion example), `while ($count -lt $n)` runs zero times and the loop reports success (reproduced in PowerShell 5.1: `0 -lt $null` is False). With `recheck.max_fix_cycles` null (the shipped textclone example) step 5's cap is undefined. | Null or non-positive pass count: stop and ask; the script throws instead of running zero passes. Null cap: use an explicit default the user confirms and report it. Report every skipped null command by key. |
| R4-3 | P2 | core-worktree | `SKILL.md:28`: `git worktree add <root>\<slug>` appends the slug, but `worktrees.root` already contains `<slug>` (`../textclone-wt/<slug>`), giving a doubled path. No rule covers null `worktrees.*` (all null in the orion example). | Substitute the slug into `worktrees.root`. If a needed `worktrees.*` key is null, stop and ask. |
| R4-4 | P2 | session skills | Nullable profile keys are read without a null rule, against core-project-profile's rule that a consumer resolves nulls before acting. Example: core-phase-gate `SKILL.md:31` waits for the exact `checkpoints.approval_phrase`, null for orion; `paths.tasks` (step 1, 3) is null for orion. | Null approval phrase: use exactly "Approve, request changes, or cancel?" and accept only "Approve". Null required path: stop and ask. Check every session skill's steps for the same gap. |
| R4-5 | P2 | core-phase-gate | The R3 trial stopped at step 1 (unticked task), so steps 2-6, including the merge, were never exercised, yet the skill was promoted. | New fresh R3 that also reaches steps 2-6 on a synthetic repo with every task ticked, ending in a local `--no-ff` merge. |
| R4-6 | P2 | session skills | No fresh session ids are recorded for the 8 session skills (the 4 skills from core-session-b record them). core-session-start has no R2 output file in its trial folder. | Re-run core-session-start R2 in a fresh headless session and keep its output; record session ids for every new R2/R3 run. |
| R4-7 | P3 | core-commit | `SKILL.md:3` sends pushing to core-phase-gate; Not for says pushing → none; core-phase-gate `SKILL.md:32` says "Never push". | Make description, Not for and decision rules agree that no skill pushes unless the user asks. A description change re-runs group R2. |
| R4-8 | P3 | all | The 12 trial folders in `muse-skills-wt\trials` were not deleted after recording (protocol §1); they hold multi-MB logs. Outside the repo, so nothing is published. | Delete them once their records are saved; report which were deleted. |
| R4-9 | P3 | core-port-safety | `evals.md` N2 ("start the checkpoint preview for textclone") observed choice was core-port-safety itself; deferred now, but likely a misfire once textclone-checkpoint-preview exists. | No change now. Re-run N2 when the target exists and sharpen the description if it misfires. |

## Not findings

- The four core-session-b skills (core-windows-env, core-port-safety, core-privacy-guard,
  core-repo-bootstrap) keep draft status correctly, record fresh session ids, and fixed
  their own trial failures within the cycle limit.
- Merge conflicts were limited to the generated `SKILLS-MAP.md` and
  `skills/02-session-and-workflow/README.md`; both were regenerated, not hand-merged.
- F08/F10b failed on both branches only because the tests assumed exactly three skills;
  fixed in `0943b12` by counting skill folders.
