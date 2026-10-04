# Trials: core-phase-gate

## Trials

### 2026-10-04 — trial/gate1: phase 1 gate stops at step 1 (unticked T2)

- Task: run phase gate for phase 1 on branch trial/gate1; expect stop at step 1 naming the unticked task. Synthetic data only; work in trials/core-phase-gate/demo.
- Skill: skills/02-session-and-workflow/core-phase-gate/SKILL.md (0.1.0 draft).
- Inputs: .muse/project.json present; paths.tasks=tasks.md, paths.handoff=docs/HANDOFF.md, paths.roadmap=null, checkpoints.approval_phrase="phase approved", recheck consecutive_passes=3 / max_fix_cycles=3.
- Result: STOP at step 1. Unticked: T2 "second demo task (deliberately unticked for the trial)". T1 ticked. Steps 2-6 not executed; no demo files written (read-only run).

Grading (step | Done-when met? | evidence | clarity):
1 | yes | `git rev-parse --abbrev-ref HEAD` -> trial/gate1 (exit 0); `Select-String -Path tasks.md -Pattern '- \\[ \\]'` -> T2 line (exit 0); tasks.md quotes T1 `[x]` / T2 `[ ]` | clear
2 | no (not reached) | not executed, gate stopped at step 1; project.json commands.test_* all null, no new tests listed in tasks.md | missing something (no empty-focused-set handling)
3 | no (not reached) | not executed; tasks.md Phase 1 lists no extra checks | missing something (zero-checks case and exact "top of phase" format undefined)
4 | no (not reached) | not executed; docs/HANDOFF.md still only "Demo start (2026-10-04)", no Phase 1 gate section | clear
5 | no (not reached) | not executed; tasks.md has no checkpoint marker for Phase 1; references/checkpoint-procedure.md exists; demo has no .agents/state/ | missing something (no rule for detecting "has a user checkpoint")
6 | no (not reached) | not executed; git log still single commit ef48718, still on trial/gate1, no merge commit | wrong for this project ("main checkout" vs AGENTS.md `master`; assumes a worktree but worktrees.root is null)

(1) Improvised (skill did not say): parsed Phase 1 as the `## Phase 1` markdown block in tasks.md; treated `- [ ]` as unticked and `- [x]` as ticked (tick syntax undefined in skill).
(2) Wrong for this project: step 6 "from the main checkout" (project uses `master`); step 6 "remove the worktree" (demo is a plain checkout, no worktree).
(3) Anti-patterns nearly committed: none committed. Nearest was continuing past unticked T2 to preview steps 2-3; stopped per Done-when instead. Did not tick T2, merge, write TRIALS.md/CHANGELOG.md, or leave the demo dir.
