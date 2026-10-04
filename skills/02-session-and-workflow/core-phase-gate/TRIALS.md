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

### 2026-10-04 — r4/r3-steps2-6: phase G2 gate runs steps 1-6 to a local --no-ff merge

- Task: full phase gate on synthetic repo "glimber" (all tasks ticked, checkpoint yes), reaching steps 2-6 and ending in a local --no-ff merge. Synthetic data only; work in trials/core-phase-gate/steps2-6.
- Skill: skills/02-session-and-workflow/core-phase-gate/SKILL.md (0.1.1 R4 text, uncommitted over a6dec9e). Fresh session 01a104eb-2fe0-7382-bcbd-cc0b8d6851e0, Lane A.
- Inputs: .muse/project.json present; paths.tasks=tasks.md, paths.handoff=docs/HANDOFF.md, paths.roadmap=null, checkpoints.approval_phrase="glimber gate approved", recheck consecutive_passes=2 / max_fix_cycles=2, known_flakes=null; real git worktree glimber-wt-g2 on branch glimber/g2-widget.
- Result: PASS 6/6. Step 1 clean (2 ticked, 0 unticked); step 2 loop passed after 1 failed cycle (cmdlet no-op fixture tripped the $LASTEXITCODE check; fixed to native no-ops, 2 consecutive passes); step 3 extra check exit 0; step 4 handoff section written; step 5 state saved, STOP, SIMULATED-USER-REPLY matched the exact phrase; step 6 merge commit b082ec1 on main, gate checks re-run on main, worktree removed, no push.

Grading (step | Done-when met? | evidence | clarity):
1 | yes | `Select-String -Pattern '- \[ \]'` -> no output; `- \[x\]` -> tasks.md:12-13 G2-T1/T2 | missing something (tick syntax and phase-block parsing undefined)
2 | yes | attempt 1 exit 1 (Write-Host leaves $LASTEXITCODE $null); probe exit 0; attempt 2: 6 native runs exit 0, 2 consecutive passes; `git diff --check` exit 0; cycles 1/2; flakes unchecked (null), roadmap skipped (null) | missing something (focused-set source format undefined; native-command assumption unstated)
3 | yes | `cmd /c echo extra-glimber-ok` -> exit 0 | missing something (check format and zero-checks case undefined)
4 | yes | `## Phase G2 gate — glimber widget (2026-10-04)` in docs/HANDOFF.md, carried to main via b082ec1 | clear (minor: skill does not say to commit the handoff)
5 | yes | .agents/state/core-phase-gate.json saved; "Re-invoke: /core-phase-gate continue" + STOP; simulated reply exact match; WAITING marked APPROVED | clear (missing: has-checkpoint detection rule)
6 | yes | `git merge --no-ff` exit 0 -> b082ec1; post-merge ticks clean + 2 passes + extra exit 0 + diff-check exit 0; `git worktree remove` exit 0; no push | clear (minor: re-run scope and post-remove branch undefined)

(1) Improvised (skill did not say): phase = `## Phase G2` block; `- [x]`/`- [ ]` ticks; "Checkpoint: yes" marker; "Extra checks:" bullets; "New tests" line; committing gate-run files on the phase branch; post-merge checks = full steps 1-3; `Get-Content` preview; branch left in place.
(2) Wrong for this project: none outright ("main checkout" and "remove the worktree" both fit). Nearest: loop `$LASTEXITCODE -ne 0` check misfires on cmdlet-valued commands ($null); harmless for real native commands.
(3) Anti-patterns nearly committed: none committed. Nearest: re-running the failed loop without a fix (diagnosed and fixed instead); merging before approval (stopped at step 5); leaving the handoff uncommitted (committed, else removal would orphan it).
