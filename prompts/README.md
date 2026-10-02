# Muse skill-build prompts

This folder holds one build prompt for every skill in [`SKILLS-CATALOG.md`](../SKILLS-CATALOG.md):
117 prompts. They are organised in the same sections as the catalog, and come with the rules Muse
follows to build them and the evaluate-and-revise loop that improves them.

Skills never train Muse ([`docs/MUSE-REFERENCE.md`](../docs/MUSE-REFERENCE.md) §1.1). A skill gets
better only when its text is edited because of measured results.

## How the pieces fit

| File | What it is | Who reads it |
| --- | --- | --- |
| [`00-BUILD-PROTOCOL.md`](00-BUILD-PROTOCOL.md) | The rules for every build: the 10 key concepts, where Muse works, the folder layout, the description contract, the nine sections (and which prompt field goes where), writing rules, the build sequence, the report, stop conditions. | Muse, once per session |
| [`01-REFINEMENT.md`](01-REFINEMENT.md) | The evaluate-and-revise loop:<br>**R1** structure check<br>**R2** routing proxy and explicit-only log check<br>**R3** invented-term fixtures run headlessly 5 times on Lane B, plus 1 cross-lane run on Lane A, scored in EVALS.csv with a ship rule<br>**R4** cross-review<br>**R5** field use<br>**R6** revision<br>**R7** regression and monthly drift<br>Statuses go draft → tested → reviewed → stable. | Muse; Codex for R4 |
| [`05-environment-and-tools.md`](05-environment-and-tools.md) | **E0** verify Muse on this PC (fills VERIFIED.md)<br>**E1** build the fixture harness<br>**E2** prove the loop on a probe<br>**E3** the trace ledger<br>**E4** optional hooks | Muse |
| [`../tools/check_skills.py`](../tools/check_skills.py) | The automatic R1 check. Run `python tools/check_skills.py [skills/<name>]`. | Muse, and the pre-commit hook |
| `10-…` to `50-…` | The 117 skill prompts, one fenced block each. | You paste them into Muse |

Each skill prompt contains:
- the exact description;
- the sources to read, with real file paths checked on 2026-10-02;
- the steps, decision rules and anti-patterns the skill must contain;
- the evidence the skill's report must show;
- the `references/` files to write;
- 5 should-trigger and 3 near-miss test requests;
- a trial task;
- the signals to watch in real use.

## Before the first batch (once)

1. Install the repo on your PC (see the root README). The live clone is
   `C:\Users\ddrac\muse-skills` for native Windows Muse, or `~/src/muse-skills` in WSL.
2. Decide whether the GitHub repo should stay public.
3. Run `05-environment-and-tools.md` **E0, E1, E2** in order, on Lane A. E0 fills `VERIFIED.md`,
   and every later prompt depends on it. If E0 shows Muse runs in WSL, follow the "How results
   change the library" table in `VERIFIED.md` first.

Start every Muse session by running `/models`. Then begin your first message with the lane, for
example "Lane A, model muse-spark-1.3" (`LANES.md`).

## Running a batch

**1. Open the batch** (paste into Muse):

```text
Lane A, model <from /models>. Read C:\Users\ddrac\muse-skills\prompts\00-BUILD-PROTOCOL.md,
01-REFINEMENT.md, VERIFIED.md and LANES.md. Create the batch
worktree for batch "<batch>" exactly as protocol §1 shows, then confirm the path and branch and
stop. Do not build anything yet.
```

**2. Build the skills:** paste the batch's skill prompts **one per message**, in the order of the
table below. Wait for the protocol §5 report each time. If a report shows R2 or R3 failing after 3
cycles, read it before moving on.

**3. Close the batch** (paste into Muse):

```text
Batch "<batch>" is built. In its worktree: run python tools/check_skills.py (all skills) and
muse skills validate on each new skill; run R2 again for every skill in this batch in one
fresh-session pass; show the EVALS.csv rows for this batch; list each skill with its status, pass
rate and open questions. Do not merge or push. Stop.
```

**4. Cross-review (R4):** give Codex the R4 prompt from `01-REFINEMENT.md`. Then paste Codex's
findings to Muse: "Apply these R4 findings per 01-REFINEMENT.md R4, one commit per skill."

**5. Merge:** you review the branch and merge it into `main` (or ask Claude to). Then run
`git -C C:\Users\ddrac\muse-skills pull`. The skills are now live in every project.

## Batch order (P1 first, dependencies respected)

| # | Batch name | Skills, in order | Prompt file |
| --- | --- | --- | --- |
| 0 | `env` | E0 verify, E1 fixture harness, E2 loop probe | 05 |
| 1 | `foundation` | core-skill-authoring, core-skill-evals, core-project-profile, core-trace-report, core-session-audit (then E3 trace ledger) | 10, 05 |
| 2 | `core-session` | core-session-start, core-worktree, core-recheck-loop, core-commit, core-phase-gate, core-escalation, core-long-run, core-handoff-writer | 20 |
| 2b | `core-session` (same batch) | core-windows-env, core-port-safety, core-privacy-guard | 24 |
| 3 | `core-quality` | core-test-first, core-debug-method, core-diff-self-review, core-flake-triage, core-web-test | 23 |
| 3b | `core-quality` (same batch) | core-codex-handoff | 27 |
| 4 | `core-product` | core-product-brief, core-acceptance-criteria, core-scope-slicer, core-user-journey-walk | 21 |
| 5 | `core-ux` | core-information-architecture, core-states-design, core-microcopy, core-readability, core-visual-design-method, core-layout-audit, core-a11y-review, core-nextjs16 | 22 |
| 6 | `core-ai` | core-ollama-models, core-prompt-versioning, core-llm-eval, core-experiment-log | 25 |
| 6b | `core-ai` (same batch) | core-stats-sanity | 26 |
| 6c | `core-ai` (same batch) | core-migration-rehearsal (a P2 pulled forward: `textclone-db-migration` needs it) | 24 |
| 7 | `textclone-core` | textclone-codebase-map, textclone-synthetic-fixtures, textclone-error-contract, textclone-sse-contract, textclone-api-contract, textclone-db-migration, textclone-generation-loop, textclone-convergence-debug, textclone-prompt-parity | 43, 42, 41 |
| 8 | `textclone-voice-ui` | textclone-eval-harness, textclone-blind-voice-test, textclone-corpus-growth, textclone-provenance, textclone-ui-guardrails, textclone-ui-parity, textclone-checkpoint-preview, orion-orb-integration | 40, 43, 50 |
| 9 | `flows` | core-flow-feature, core-flow-bugfix, core-flow-ui-change, core-flow-experiment | 30 |

That covers all 60 P1 skills plus one pulled-forward P2.

**P2 batches** (build after batch 9, one catalog section at a time):
- `foundation-2`: core-skill-maintenance, core-retro. Build this one first, because `core-retro`
  automates R5 and R6.
- `core-session-2`: core-context-budget, core-report-writer.
- `core-product-2`: core-premortem, core-decision-record.
- `core-ux-2`: core-ux-heuristics, core-motion.
- `core-eng-2`: core-git-bisect, core-refactor-safely, core-api-design, core-state-machines,
  core-concurrency-review, core-perf-profiling, core-dependency-audit, core-security-review.
- `core-ops-2`: core-backup-drill, core-crash-recovery, core-ci-setup.
- `core-ai-2`: core-structured-output, core-judge-calibration, core-retrieval-quality,
  core-latency-budget, core-dataset-hygiene.
- `core-coord-2`: core-roadmap-sync, core-task-authoring, core-research-sources.
- `textclone-2`: textclone-ingest-adapter, textclone-stylometry-metric, textclone-registers,
  textclone-ai-tells, textclone-detect-calibration, textclone-critic-repair,
  textclone-new-task-type, textclone-latency, textclone-llm-router, textclone-compose-registry,
  textclone-ingest-pipeline, textclone-profile-feature, textclone-doctor-check,
  textclone-jobs-recovery, textclone-dictation, textclone-voice-glossary.
- `orion-2`: orion-orb-states.

**P3 skills** (build when the need first comes up): core-dogfood, core-onboarding,
core-property-tests, core-mutation-check, core-type-hardening, core-local-observability,
core-release, core-windows-packaging, core-flow-release, textclone-finetune-safety,
textclone-multi-profile, textclone-launcher.

## After the skills exist: keep training them

- End real tasks with `/core-trace-report` so every run is pinned to an export hash.
- Add the **R5 field-use** line from `01-REFINEMENT.md` to the end of your normal Muse task
  messages, until `core-retro` is built.
- Re-run all fixtures monthly or after a Muse update (R7), because docs and defaults drift.
- Every 3 field uses, or after any miss, run **R6 revision** for that skill.
- A skill reaches `stable` after 3 real uses in a row with no miss.
- When Textclone or Orion change, run `core-skill-maintenance`, so skills don't go stale.
