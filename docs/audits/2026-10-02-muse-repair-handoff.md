**Muse handoff: repair the refinement audit findings**

Implement the repairs described here. Reproduce each defect, make the smallest coherent fix, and verify the result. The requested scope is F01–F23 and the small B01 cleanup from the audit. Do not stop after writing another plan. Leave the result ready for review; do not merge or push.

Read these two files first:

- [Audit report](2026-10-02-refinement-report.md): findings, locations, causes, and suggested fixes.
- [Audit evidence](2026-10-02-refinement-evidence.json): observed outcomes and controls. This records defects in the old implementation; it is not a passing regression suite.

Read the current `prompts/00-BUILD-PROTOCOL.md`, `prompts/01-REFINEMENT.md`, `SELF-DEVELOPMENT.md`, and applicable repository instructions before editing. Resolve the specific contradictions identified by the audit as part of this task. Existing user instructions take precedence.

**Starting state and scope**

The audited checkout was on `muse/skills-foundation` at commit `016c1e3fdcb9913c289b9225ab13804b36093bc8`. No fixes have been applied by Codex. At handoff creation, the audit artifacts were untracked under `docs/audits/`; preserve them. Recheck the actual state rather than assuming it still matches.

The repository contains three implemented skills, two JavaScript tools, an installer, and a pre-commit hook. Its other 125 catalog entries are planned skills. Building those skills is outside this repair task. Textclone and Orion are source material for profile facts, not application repositories to modify during this work.

The original checks all passed despite the defects:

- R1: three skills, zero errors and warnings.
- Generated map: current.
- JavaScript syntax: valid for both tools.
- Muse validation: all three skills valid, zero diagnostics.

The audit ran 37 behavior probes in three independent temporary setups. The evidence includes successful controls and rejected hypotheses as well as failures. Some probe names describe suspicions that were disproved; use their actual outcomes and the final report when deciding what to fix.

**Before editing**

1. Record the actual repository root, branch, HEAD, working-tree changes, and staged changes. Inspect `git worktree list` and determine whether this checkout is a live installed source. Preserve work belonging to other sessions.
2. Work in a dedicated repair branch/worktree. Base it on the foundation state containing all three implemented skills, plus any relevant subsequent changes. Do not blindly branch from `origin/main`: at audit time it lacked the foundation work under review. Do not switch or edit a live installed clone.
3. Ensure the untracked handoff/report/evidence are readable from the repair worktree. Git does not copy untracked files into a new worktree; copy these named artifacts explicitly if necessary. Keep the historical audit and evidence unchanged.
4. Record Node, PowerShell, and Muse versions. The audit used Node 24.18.1, Windows PowerShell 5.1.26100.9444, and Muse 1.4.2. Check executable availability before relying on it.
5. Re-run the baseline checks and inspect any intervening changes. If a finding has already been fixed, prove that with the relevant regression and mark it already resolved. Do not restore a defect merely to match the audit.
6. Create a new repair-results document alongside this handoff. Track every finding ID, its disposition, changed files, test command, observed result, and remaining review requirement. Keep failures and blocked checks visible.

For this implementation request, routine scoped repairs and their tests are the work to perform. Do not request approval for each individual edit. Preserve the existing human review requirement for self-development bootstrap certification and for any merge. Report a genuine blocker for its affected part while continuing independent repairs.

**Repair order**

Use distinct batches so the evaluator and the skills it evaluates are not revised together. Respect `SELF-DEVELOPMENT.md`'s “one level at a time” and “no self-grading” rules. A new evaluator passing its own checker is not independent approval.

| Batch | Findings | Work |
| --- | --- | --- |
| A — tooling and installation | F01–F15, B01 | Add independent executable regression tests; repair the hook, scanner, validator, installer, and generator. |
| B — evaluation procedure | F19, F21, F22, evaluator portion of F20, F23 | Align authoritative rules and evaluator behavior; establish honest bootstrap and regression gates. |
| C — project profile | F16–F18, profile portion of F20 | Repair the example commands and profile contract, source inventory, and isolated trials. |
| D — final verification | All IDs | Run integrated checks, regenerate outputs, reconcile records, and prepare the review report. |

Pin the tool revision and evaluator used for each batch. Complete and record one batch before editing the next. Until an independent evaluator is available, perform useful diagnostics but label certification as pending. Do not invent a stable tag to clear the gate, and do not let an unreviewed evaluator certify itself or its dependents.

**Batch A: required behaviors and regression checks**

These are acceptance criteria. Add durable, repeatable tests that fail on the audited implementation and pass after the repair. Use temporary synthetic repositories and fixtures. Prefer the existing dependency-free Node/PowerShell approach where practical. Never use real tokens, live profiles, or user installation targets as test fixtures.

| ID | Required repair and proof |
| --- | --- |
| F01 | Check the Git index, not unstaged working files. A staged secret hidden by a clean unstaged replacement must fail. A clean staged file with an unstaged secret must be judged by staged content. A stale staged map hidden by a current working map must fail. Verify that hook execution preserves both the real index and working tree. |
| F02 | Preserve filenames end-to-end, using NUL-delimited Git data or an equivalent robust API. Test spaces and Unicode; cover additional names supported by the test filesystem. A secret in a spaced fixture path must fail. An unexpectedly missing explicitly requested scan input must produce a diagnostic and nonzero exit. Do not turn intentional Git deletions into missing-input errors. |
| F03 | Scan rename/copy destinations and validate folders affected by deletions. An internal rename that adds a secret must fail. Removing `evals.md` from a surviving skill must fail. Complete intentional skill removal must work when catalog/map inputs are consistent. Keep the passing cross-boundary rename control. |
| F04 | Scan all matches for every privacy rule. Only the exact intended noreply address is exempt. A permitted address before a private address must fail; a longer address containing the permitted substring must fail. An allowed-only fixture must pass. |
| F05 | Remove secret values from all scan diagnostics. Capture stdout and stderr and assert that neither the synthetic token nor its identifying prefix is printed. Retain actionable filename/line/rule information without reproducing matched content. |
| F06 | Recursively scan publishable skill contents, including nested references, fixtures, and scripts. The same synthetic secret must fail at each depth. Define and test handling of junctions/symlinks so scanning cannot escape its scope or loop indefinitely. |
| F07 | Detect forward-slash, backslash, and serialized Windows personal paths. Keep controls for harmless relative paths. Test supported Unix personal paths as well; avoid broad patterns that reject every ordinary file path. |
| F08 | Use normalized, directory-boundary-aware ownership checks for installer cleanup. An unrelated dangling junction into a similarly prefixed sibling must survive. A genuinely owned dangling junction may be removed. Real directories and links owned elsewhere must remain untouched; target contents must never be removed. |
| F09 | Make `-WhatIf` non-mutating for filesystem and Git configuration operations. Snapshot both before/after. Test existing and nonexistent targets; both dry runs must finish without writes or false completion claims. |
| F10 | Check native Git exit status explicitly. A configuration failure must produce nonzero exit and no “scan enabled” claim. Normal installation and repeat installation must still succeed against temporary targets. |
| F11 | Check the underlying reference file when a Markdown link has a fragment. Missing file with or without `#section` must fail; existing reference file with a fragment must pass the file-existence check. Do not imply anchor validation unless it is actually implemented. |
| F12 | Validate required eval sections, unique IDs, request/target format, and the Results table. Repeated IDs, missing headings, or tests outside the intended sections must fail. Valid draft files with an empty results table must remain acceptable. Preserve existing test requests. |
| F13 | Validate the actual newest changelog version heading. An invalid top entry followed by a valid older entry must fail, and the generator must not silently display the older status. Valid draft/tested/reviewed/stable histories must still work. |
| F14 | Validate all map consistency rules before writing generated output. Invalid input must fail without changing any of the 14 generated files. Snapshot their hashes. `--check` must remain non-mutating for valid, invalid, and stale inputs. |
| F15 | Retain “Instead, use” alternatives even when those skills also appear in “Pairs with.” Confirm the authoring row retains its three explicit alternatives. Keep correct built-skill section parsing and prompt-derived relationships. |
| B01 | Remove the unused parsed prompt `name` and `file` properties, unless an actual diagnostic consumer is added for a justified reason. Isolate this cleanup from behavior changes and compare all generated outputs before/after; removal alone should have no output effect. |

A snapshot-based hook must use staged inputs consistently for structural and map validation as well as privacy scanning. Resolve relative paths against the snapshot root. Do not use `git stash`, reset the user's worktree, or rewrite the index to make staging tests convenient. Run destructive fixture setup/cleanup only inside verified disposable paths.

Keep a working failure oracle: a regression test passes when the repaired program produces the required result. The old audit's unexpected exit-0 results must not become the new expected success values. Generate synthetic credential strings at test runtime where helpful so the test source itself does not resemble committed credentials.

**Batch B: authoritative rules and independent evaluation**

| ID | Required repair and proof |
| --- | --- |
| F19 | Establish one R2 pass policy in `01-REFINEMENT.md` and mirror it in the evaluator and result formats. Distinguish a correct available route, an incorrect route, and an unavailable target. An unavailable target must not be counted as a successfully exercised target. Preserve the expected request/target and record a rerun dependency. If the policy permits a provisional outcome, name its limits explicitly; do not silently turn partial scores into a full pass. |
| F20, evaluator | Add a real isolated evaluator trial covering its normal recording/status path. Explicitly mark applicable, inapplicable, failed, and blocked steps. Exercise important failure/retry/stop behavior with controlled synthetic cases; conditional branches need not all execute in one happy-path run. Append corrections and new evidence; do not rewrite historical trial outcomes. |
| F21 | Compute regression scope before testing. Any skill change must trigger the group R2 scope required by R7, even for a single-skill invocation or a non-description edit. Profile schema changes must identify affected core-skill R3 trials. Test both scope decisions with synthetic changes. Use catalog groups rather than assuming category folders are the same groups. |
| F22 | Move trusted-evaluator/checker selection ahead of grading, repairs, and promotion. Use a previous stable evaluator tag when one exists. If none exists, record a bootstrap review requirement and do not self-certify. Verify that a missing tag cannot fall through to an unsupported “reviewed” or “stable” result. |
| F23 | Correct the schema reference to `skills/03-project-setup/core-project-profile/references/schema.md`. Check required source paths after category reorganizations. Do not confuse planned optional references with missing required files. |

Preserve T/N requests and historical evidence. Add regression cases instead of weakening tests to force a pass. Update changelogs with `Because:` citations to the finding IDs and new trial evidence. Use appropriate increasing versions; do not blindly append the initial `0.2.0` version to an already versioned skill.

Once changed, the protocol, evaluator instructions, references, result formats, and reported statuses must agree. A completed assistant turn, a source inspection, and a passing structural check are different forms of evidence; do not treat them as interchangeable.

**Batch C: profile contract and trials**

| ID | Required repair and proof |
| --- | --- |
| F16 | Make command strings compatible with the documented shell. Prefer retaining Windows PowerShell 5.1 support for this scoped repair rather than silently adding a new runtime requirement. Parse all examples in that shell. Use harmless stubs to prove a failed build prevents subsequent tests from executing; replacing `&&` with `;` alone is not a repair. |
| F17 | Define one working-directory rule for web commands and make both examples follow it. The smallest option is to run web commands inside `web_dir` and omit an extra `cd web`. Verify root and web execution directories with stubs in a synthetic project. Change the schema shape only if needed, and then apply the schema-dependent R7 regression rule. |
| F18 | Re-read the current cited Orion service documentation. Reconcile its documented voice listener with Orion's owned ports and Textclone's forbidden ports. Update source citations. Assert no owned/forbidden overlap per profile; do not start services or infer ports from private `.env` contents. |
| F20, profile | Exercise create, validation, write, diff, and update behavior in synthetic repositories/worktrees. Demonstrate that an update changes only stale keys and does not merge. Separate mode-specific steps; list inapplicable steps explicitly. Record a fresh execution of changed steps rather than claiming source-reading alone meets their Done-when. |

Do not modify Textclone or Orion applications, live `.muse/project.json` files, databases, secrets, or running services. Profile facts may be checked read-only against their sources. Execute commands against synthetic stubs for syntax, failure propagation, and working-directory tests; passing those tests does not establish that either application's full build or test suite passes.

**Doctor and fresh-session requirements**

The requested code-audit doctor skill was not identified during the audit. Only TinyFish's connectivity doctor was found, and it is unrelated to this repository. Look for the intended skill in the current environment. If available, read its instructions and run applicable checks in the repair worktree. Name the skill and show the results.

If it remains unavailable, finish the independent repairs and explicitly mark doctor verification unavailable. Do not substitute TinyFish or an unrelated project's doctor, claim it ran, or build a new doctor just to close this task. Likewise, if a security scan is required by the active environment, run it when applicable and report an unavailable scanner honestly; it does not replace the targeted regression tests.

R2 and R3 require fresh Muse sessions as specified by the repository. Record the sessions' task scope, evaluator/tool revisions, and results without private payloads. If fresh sessions cannot be run, preserve that verification gap. Do not relabel the current implementation session as a fresh independent test. R5's three real field uses cannot be manufactured with synthetic trials, so this repair cannot by itself justify a stable status.

**Final checks and delivery**

First run each new regression against the original faulty behavior where reproducible, then against the repaired implementation. Preserve legitimate passing controls. After the last implementation change, run the full repair suite in three separate clean synthetic setups and compare outcomes. Investigate inconsistent results instead of accepting a favorable run.

Run the following from the repair repository root, checking and recording each exit code immediately:

```powershell
node --check tools/check-skills.mjs
node --check tools/skill-map.mjs
node tools/check-skills.mjs
node tools/skill-map.mjs
node tools/skill-map.mjs --check
muse skills validate skills/01-self-development/core-skill-authoring --json
muse skills validate skills/01-self-development/core-skill-evals --json
muse skills validate skills/03-project-setup/core-project-profile --json
git diff --check
git status --short
```

This block is a list of commands, not an assertion that the last command's success proves the others succeeded. Add and document the actual regression-suite command once implemented. Validate newly added JavaScript/PowerShell files too. Generated maps and category READMEs must come from the generator, not manual edits.

The integrated hook tests must exercise staged content, partial staging, supported unusual filenames, rename/copy/delete cases, and a normal clean commit. Verify dry-run/install behavior only with temporary targets. In a real Git worktree, resolve metadata locations through Git rather than assuming `.git` is a directory.

Keep commits focused by defect cluster, and follow the one-skill-per-commit convention for skill changes. Include relevant tests and generated outputs. Do not disable the real hook to land repairs; fixture baseline setup may disable hooks only in disposable synthetic repositories. Do not stage unrelated user files. No push or merge.

At completion, provide:

- A disposition for every ID F01–F23 and B01: fixed, already resolved, disproved with evidence, or blocked with the exact reason. Do not silently omit an ID.
- Files and commits for each repair cluster, plus the final branch and HEAD.
- Regression commands, individual exit codes, and all three final clean-run summaries.
- Updated R2/R3 records, their scope, and pending independent/human review gates.
- Doctor/security-scan results or exact availability limitations.
- Remaining risks and the next review action. Do not claim the work is fully verified while required checks remain blocked.

The final repair report must describe the resulting implementation, not merely repeat the old audit. Keep the old report and evidence as the unchanged baseline for comparison.
