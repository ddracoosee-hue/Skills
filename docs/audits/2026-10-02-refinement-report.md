**Refinement audit — 2026-10-02**

The current checks pass, but they do not establish that the refinement gates or privacy protections work correctly. This audit identifies 23 functional or workflow findings and one small, verified dead-data cleanup opportunity. No fixes were applied. The only additions to the checkout are this report and its [test evidence](2026-10-02-refinement-evidence.json).

Audited branch: `muse/skills-foundation`. Commit: `016c1e3fdcb9913c289b9225ab13804b36093bc8`. The checkout was clean before the audit. This is an audit of the present repository, including inherited defects, not solely a review of newly introduced lines.

Scope: `prompts/01-REFINEMENT.md`, its build protocol, all three implemented skills and their references/evaluation records, both JavaScript tools, the PowerShell installer, the Git hook, and generated-map behavior. Textclone and Orion files were consulted to verify profile examples. Their application codebases were not audited in full. The remaining 125 catalog skills are planned, not implemented; they cannot be certified as working code.

**Verification and limits**

| Check | Observed result |
| --- | --- |
| `node tools/check-skills.mjs` | Exit 0; 3 skills, 0 errors, 0 warnings |
| `node tools/skill-map.mjs --check` | Exit 0; generated files current |
| `node --check` on both JavaScript tools | Both exit 0 |
| `muse skills validate <folder> --json`, each implemented skill | All three exit 0, `valid: true`, zero diagnostics |
| Behavior probes in isolated copies | 37 probes, repeated in three fresh setups: 111 executions; identical exit-code results |
| PowerShell parsing of example commands | 10 commands per run, repeated three times; 2 Orion commands consistently rejected |
| Installer ownership-boundary probe | Unrelated dangling junction removed in all three runs |
| Removal of unused prompt metadata, in a copy only | All 14 generated outputs byte-identical in three runs |

Environment: Node `v24.18.1`, Windows PowerShell `5.1.26100.9444`, Muse Code `1.4.2 (1.4.2-R4684.1)`. Muse validation required access outside the initial sandbox and subsequently ran successfully. Git warned that the global ignore file was unreadable; synthetic repository operations and control tests still completed. No real credentials, live databases, servers, or application builds were used in the reproductions.

The requested repository **doctor skill was not found** in the repository or installed skill directories searched. The only installed skill named `doctor` was TinyFish's setup/authentication/connectivity doctor, which does not verify this repository. Clarification was requested. These results are therefore repository checks, Muse validation, and independent audit probes—not a doctor-skill certification. Fresh Muse R2/R3 sessions and R5 field use were not rerun. Historical trial records were reviewed as claims and evidence, not assumed to be current successful executions.

P1 means a privacy protection can be bypassed or can disclose the material it detects. P2 means a reproducible functional defect or a documented workflow inconsistency that can cause incorrect results. P3 denotes a low-impact cleanup. Reproduction IDs below identify records in the evidence JSON. The scripts operated on temporary copies; suggested fixes describe future work only.

**P1 findings**

**F01 — The pre-commit hook checks working-tree content rather than the content being committed.**

Location: `.githooks/pre-commit:8–11,18`; `tools/check-skills.mjs:120–122`.

Reproduction: stage a reference file containing a synthetic token, then replace its working-tree content with harmless text without staging that replacement. The hook exits 0 while `git show :<path>` still contains the token. A stale staged `SKILLS-MAP.md` also passes when the working-tree map is current. Evidence: `hook-partially-staged-secret`, `hook-staged-map-diverges`, three runs each.

Impact: the privacy and generated-file checks can approve a commit whose actual contents fail those checks. This is not just a missing pattern; the hook examines the wrong version of every file.

Suggested fix: inspect index blobs, or construct a temporary snapshot of the index and run every gate against that snapshot. Include a partial-staging regression test.

**F02 — Filenames containing spaces bypass hook scanning.**

Location: `.githooks/pre-commit:8–12`; `tools/check-skills.mjs:121`.

Reproduction: stage `skills/01-self-development/core-skill-authoring/fixtures/space fixture/prompt.txt` containing a synthetic token. The hook exits 0. Shell expansion splits `$files` into nonexistent paths, and the scanner silently skips them. A conventional immediate reference-file token is rejected by the control test. Evidence: `hook-spaced-filename-secret`, `missing-scan-file`, `hook-control-secret`.

Impact: a valid tracked filename defeats the intended privacy gate; the same parsing also mishandles Git's quoted path output.

Suggested fix: use NUL-delimited Git output with a consumer that preserves each filename as a single value. Make unexpected missing scan inputs an error rather than a successful empty scan.

**F03 — The hook excludes renamed and deleted files from validation.**

Location: `.githooks/pre-commit:8` (`--diff-filter=ACM`).

Reproduction: rename a clean tracked fixture within `skills/`, append a synthetic token, and stage it. Git reports `R098`; the hook exits 0. Separately, delete and stage a skill's required `evals.md`: the hook exits 0, while the full checker correctly exits 1. Evidence: `hook-internal-rename-secret`, `hook-deleted-evals`, `checker-deleted-evals-control`.

Impact: a renamed fixture can introduce private content, and a deletion can leave an invalid installed skill. The initial cross-boundary rename control was correctly rejected because the path-limited diff treated it as an addition; the confirmed bypass is the within-scope rename described above.

Suggested fix: scan added/modified/copied/renamed destination blobs and validate affected skill folders for deletions too. Only skip folders intentionally removed in full.

**F04 — The email exception suppresses unrelated private addresses.**

Location: `tools/check-skills.mjs:22,111–113,123–125`.

Reproduction: `--scan` rejects a synthetic private address alone, but exits 0 when the same address follows the permitted noreply address. A longer address containing the allowed address as a substring also passes. Evidence: `control-email`, `allowed-email-first`, `allowed-email-substring`.

Cause: `String.match()` returns only the first email, and the allowlist is an unanchored substring expression. A permitted first match prevents examination of the remaining matches for that pattern.

Suggested fix: examine every match and exempt only an exact normalized allowlisted address.

**F05 — The scanner prints detected secret values to its output.**

Location: `tools/check-skills.mjs:125`.

Reproduction: scan a synthetic token shorter than the 40-character diagnostic limit. The scanner correctly exits 1 but prints the entire token in stdout. Evidence: `scan-discloses-token`. The durable evidence file redacts the synthetic value.

Impact: hook output, agent transcripts, or copied diagnostic reports can become a second location for a secret. Longer credentials still have their first 40 characters exposed.

Suggested fix: report the filename, line number, and rule identifier without the matched value. Keep any identifier irreversible and non-reconstructive if one is necessary.

**P2 findings: checker and installer**

**F06 — R1's privacy scan does not cover the whole skill directory.**

Location: `tools/check-skills.mjs:105–109`.

Reproduction: the same synthetic token fails in `references/sample.md` but passes in `references/nested/sample.md` and `fixtures/sample/prompt.txt`. Evidence: `top-level-reference-secret`, `nested-reference-secret`, `fixture-directory-secret`.

Impact: the advertised per-skill privacy check misses nested references, fixtures, and other supporting files. Correctly named staged files may still be caught by the hook's separate scan; that does not make standalone R1 complete.

Suggested fix: recursively enumerate the intended publishable contents of a skill, including fixtures and scripts, with explicit exclusions and safe handling of links.

**F07 — Forward-slash Windows personal paths bypass the scanner.**

Location: `tools/check-skills.mjs:21`.

Reproduction: a synthetic `C:/Users/SyntheticUser/private/file.txt` passes; its backslash equivalent fails. Evidence: `forward-windows-path`, `control-backslash-path`.

Cause: the Windows expression requires backslashes; the Unix expression's lookbehind prevents it from matching the `/Users/` portion after a drive prefix.

Suggested fix: cover both Windows separator styles, including serialized doubled separators, while retaining controls for harmless relative paths.

**F08 — Installer cleanup can delete a junction owned by another source.**

Location: `install.ps1:28–31`.

Reproduction: create an unrelated junction targeting a retired folder under a sibling named `skills-other`, next to the repository's `skills` directory. The installer removes it because its destination starts with the text of `$repoSkills`. Repeated three times; the evidence records junction count changing from 1 to 0.

Impact: the ownership test violates the installer's promise to remove only links into this repository. The reproduced deletion removed the junction, not its target contents.

Suggested fix: normalize the target and require a directory-boundary-aware descendant relationship to the exact repository skills directory. Include a similarly prefixed sibling control.

**F09 — `-WhatIf` is not a reliable dry run.**

Location: `install.ps1:25–28,54`.

Reproduction: with an existing target, run `install.ps1 -Target <temporary-target> -WhatIf` after setting `core.hooksPath` to `prior-hooks`. The command exits 0 but changes it to `.githooks`. With a nonexistent target, the dry run exits 1: directory creation is correctly skipped, but `Get-ChildItem` then attempts to enumerate that nonexistent directory. Evidence: `installer-whatif-changes-hooks`, `installer-missing-target-whatif`.

Suggested fix: put the Git configuration write behind `ShouldProcess`; avoid enumerating a target whose creation has only been proposed. Report proposed operations as proposed.

**F10 — A failed Git configuration command is reported as successful installation.**

Location: `install.ps1:54–55`.

Reproduction: run a copied installer in a directory containing the skills but no Git repository. Git prints `fatal: not in a git directory`; the script exits 0 and says “Pre-commit scan enabled.” Evidence: `installer-git-failure-hidden`.

Cause: Windows PowerShell's `$ErrorActionPreference = 'Stop'` does not turn this native command's nonzero exit into a terminating PowerShell error.

Suggested fix: inspect `$LASTEXITCODE` immediately and fail before claiming the hook is enabled. The normal and repeated-install controls both succeeded with three links.

**F11 — Links with fragments bypass reference-file existence checks.**

Location: `tools/check-skills.mjs:82–84`.

Reproduction: a link to `references/absent.md` fails; changing only its target to `references/absent.md#section` passes. Evidence: `broken-plain-reference`, `broken-anchor-reference`.

Impact: ordinary section links can conceal a missing required reference file, despite R1's documented link check.

Suggested fix: parse the link target, separate its fragment, and check the underlying file. Independently decide whether to validate the section anchor itself.

**F12 — Invalid trigger-test files satisfy R1.**

Location: `tools/check-skills.mjs:89–94`.

Reproduction: remove both required test-section headings, repeat `T1` three times and `N1` twice, and retain only a `## Results` heading with no table. The checker reports zero errors. Evidence: `evals-missing-sections-duplicate-ids`.

Impact: R2 reads tests *under* “Should trigger” and “Should not trigger,” but R1 accepts a file containing neither section. Duplicate IDs and absent result-table structure also pass.

Suggested fix: validate the section boundaries, unique test IDs, request/target shape, and required Results table. Count tests inside the appropriate sections.

**F13 — Changelog validation can silently skip an invalid newest version.**

Location: `tools/check-skills.mjs:100–102`; corresponding matching in `tools/skill-map.mjs:51–52`.

Reproduction: place `## 0.2.0 — 2026-10-02 — BROKEN` above a valid older draft entry. R1 exits 0 by finding the older matching heading. Evidence: `changelog-malformed-latest`.

Impact: the refinement document defines current status as the newest heading, while the implementation can validate or display a previous version instead.

Suggested fix: find the actual first version heading and validate that exact heading; do not search past it for one that looks valid. Apply the same rule to map generation.

**P2 findings: generated map and profiles**

**F14 — Invalid map input overwrites generated files before failing.**

Location: `tools/skill-map.mjs:57–74,136–147`.

Reproduction: in a copy, add a nonexistent skill to a category. Generation reports missing-prompt/catalog errors and exits 1, but first rewrites two output files with the invalid entry and a total of 129 skills. Evidence: `invalid-map-writes-before-error`.

Impact: failed generation leaves incorrect artifacts in the working tree instead of preserving the previous valid map.

Suggested fix: stop after consistency validation and before any output write when `problems` is nonempty. Keep `--check` non-mutating.

**F15 — “Instead, use” hides explicit alternatives whenever they are also related skills.**

Location: `tools/skill-map.mjs:92–94`; `SKILLS-MAP.md:62`.

Observed: `core-skill-authoring` excludes trigger testing, field-log revision, and maintenance in its `Not for` section, but its generated “Instead, use” cell is empty. The same skills are in “Pairs with,” so `!works.includes(n)` discards all three alternatives. In a temporary copy, removing only that exclusion restores the three entries. Evidence: `mapAlternativeRouting`.

Impact: readers lose the map's explicit guidance about which skill should handle a near-miss. Being related does not invalidate being an alternative for a particular request.

Suggested fix: retain exclusion/alternative semantics even when a skill is also related; do not deduplicate across columns with different meanings.

**F16 — Orion's example test/build commands do not parse in the documented Windows PowerShell environment.**

Location: `skills/03-project-setup/core-project-profile/references/orion-example.json.md:17,22`; validation procedure at `SKILL.md:29` in that skill.

Reproduction: parse `npm.cmd run build && npm.cmd test` and `cd web && npm.cmd run build` with Windows PowerShell 5.1's language parser. Both report that `&&` is not a valid statement separator. The other eight example commands parse. Results repeat identically three times. The example leaves `shell` null and declares no PowerShell 7 requirement.

Impact: executable-existence checks pass over a command string that the current shell cannot run. This is specifically a Windows PowerShell 5.1 failure; it is not a claim that `&&` fails in PowerShell 7 or cmd.

Suggested fix: specify the actual shell/version contract and validate command syntax against it. If supporting PowerShell 5.1, preserve failure-short-circuit behavior when adapting compound commands; replacing `&&` with `;` alone is insufficient.

**F17 — Web command working-directory rules are inconsistent.**

Location: `skills/03-project-setup/core-project-profile/SKILL.md:29`; `references/schema.md:31–35`; `references/orion-example.json.md:22` and `references/textclone-example.json.md:23` in the same skill.

Evidence: validation resolves web command executables from `web_dir`; Textclone's build command is `npm.cmd run build`, requiring that directory. Orion's is `cd web && npm.cmd run build`, requiring the project root. Neither example has a `web/web` directory. A consumer cannot apply one working-directory rule to both values: entering `web_dir` first makes Orion's additional `cd web` invalid, while always using the root misdirects Textclone's build.

Suggested fix: define one working directory for all web commands, or model each command with an explicit working directory. Validate both syntax and directory transitions. No real project build was run for this finding.

**F18 — Both profile examples omit Orion's documented voice port.**

Location: `skills/03-project-setup/core-project-profile/references/orion-example.json.md:32–38`; `references/textclone-example.json.md:34–39` in the same skill.

Evidence: Orion's cited `CLAUDE.md:794` identifies its separate voice FastAPI process on port `8788`; the browser connection is also described at `CLAUDE.md:632`. The Orion example's owned list omits 8788, and the Textclone example's forbidden list omits it. This conflicts with the schema definition at `references/schema.md:14–16`.

Impact: downstream port-safety decisions based only on these examples have an incomplete inventory. No actual live port collision is claimed.

Suggested fix: reconcile the profiles with all documented service listeners, including voice, and cite the source for each addition.

**P2 findings: refinement and evaluation workflow**

**F19 — The authoritative R2 pass rule and the implemented evaluator use different criteria.**

Location: `prompts/01-REFINEMENT.md:72`; `skills/01-self-development/core-skill-evals/references/r2-prompt.md:21–23`; all three skill changelogs at line 4.

Evidence: refinement requires every near-miss to choose its expected arrow target. The evaluator adds an exception allowing `none` when the target is unbuilt. Recorded near-miss scores remain 2/3 for authoring and 1/3 for the other two skills, yet changelogs describe R2 as passed.

Impact: the same evidence receives a pass or non-pass depending on which document an agent follows. This is a criteria conflict, not a claim that routing to `none` is intrinsically wrong when a target is absent.

Suggested fix: define one policy in the authoritative protocol. Distinguish deferred/unavailable targets from successful tested routes, and preserve outstanding reruns without changing test requests to force a pass.

**F20 — Two recorded R3 passes do not establish the required end-to-end trial coverage.**

Location: `skills/01-self-development/core-skill-evals/TRIALS.md:5`; `skills/03-project-setup/core-project-profile/TRIALS.md:5–6`; both corresponding `CHANGELOG.md:3–4`; `prompts/01-REFINEMENT.md:106`.

Evidence: the evaluator's passing trial records steps 4 and 8 as blocked, steps 5/6/7/9 as unexercised, and user review as pending. Profile trials explicitly put steps 4–6 outside scope, followed by a confirmation-only PASS. Refinement requires every applicable Done-when to be met with no outcome-changing improvisation. Conditional failure paths need not run on every happy-path trial, but required recording/status work and the profile's normal write/diff workflow need evidence.

Impact: “tested” currently implies more verified behavior than these records demonstrate. Source-reading a step is not an execution of that step.

Suggested fix: define mode-specific applicability and retain explicit deferred gates. Exercise the normal create/update/write/diff and evaluator recording/status paths in isolated scratch repositories before promoting them. This audit does not retroactively alter their status.

**F21 — The evaluator's regression rule is narrower than R7.**

Location: `skills/01-self-development/core-skill-evals/SKILL.md:37`; `prompts/01-REFINEMENT.md:196–198`.

Evidence: the skill says to rerun group R2 “For a group” after a description change. R7 requires group R2 after *any skill change*, and requires affected core-skill R3 when profile schema keys change. The implemented step can therefore leave single-skill or non-description revisions without the required regression scope; it also omits the schema-dependent expansion.

Suggested fix: derive the regression set from changed skills and schema keys before choosing tests, matching the authoritative R7 rule regardless of how the user selected the initial scope.

**F22 — The no-self-grading gate occurs after grading, edits, and status promotion.**

Location: `skills/01-self-development/core-skill-evals/SKILL.md:30–38`; `SELF-DEVELOPMENT.md:44–46`.

Evidence: numbered steps run the current checker, assess R2/R3, permit fixes, and update status in steps 2–9; selecting the previous stable evaluator/checker occurs in step 10. Following the numbered order uses the new procedure to assess itself before enforcing the independence requirement. No stable evaluator tag exists in this checkout; the recorded fallback is pending human review.

Impact: the independence gate cannot protect actions already taken under the new evaluator. This is a static workflow-order defect; no automatic self-modification was performed during this audit.

Suggested fix: choose the trusted evaluator/checker, or the explicit bootstrap review path, before any test, revision, or promotion. Then execute the selected procedure once.

**F23 — The build protocol points to the old, nonexistent schema location.**

Location: `prompts/00-BUILD-PROTOCOL.md:74`.

Evidence: it names `skills/core-project-profile/references/schema.md`. The actual file is `skills/03-project-setup/core-project-profile/references/schema.md`. The old path does not exist.

Impact: an agent following the required source lookup encounters a missing dependency and the protocol's stop condition, despite the schema being present elsewhere.

Suggested fix: update the canonical source path and check protocol links/path references when reorganizing categories.

**P3 — Confirmed redundancy, plus candidates deliberately rejected**

**B01 — Two stored prompt metadata fields have no consumers.** Location: `tools/skill-map.mjs:36`. Parsed prompt objects store `name` and `file`, but subsequent code reads neither. In a temporary copy, removing those two properties produced byte-identical `SKILLS-MAP.md` and all 13 category READMEs in three runs. This is a small cleanup opportunity, not evidence of material runtime or bundle bloat. Suggested fix: remove the fields if they are not intended for forthcoming diagnostics, or actually use them in diagnostics.

No large unused module or dependency was confirmed. The 125 planned prompts, generated category READMEs, and repeated human-facing guidance have identifiable discovery/build purposes. They should not be removed merely because they are not executed as JavaScript.

The following suspicions were checked and excluded from the functional findings:

- The map's built-skill section parser works. Adding a built `Related` or `Not for` entry changed the appropriate generated output. The probe IDs beginning `map-ignores-built-...` were initial hypotheses, not confirmed failures; their observed results disprove them.
- Invalid YAML-like frontmatter, including an unclosed quote and a duplicate description key, is accepted by the local checker. Muse's own validator also accepted both with zero diagnostics. That is a formal-validation limitation, but this audit did not establish an actual Muse loading failure, so it is not presented as one.
- Deleting `SKILL.md` alone was caught indirectly by stale-map detection. The separate required-`evals.md` deletion is the confirmed bypass in F03.
- A rename from outside the hook's scanned paths into `skills/` was caught. The internal rename is the confirmed bypass in F03.
- A conventional secret-bearing reference file was rejected, the normal installer created three junctions, and a second installation was idempotent. The failure-path findings do not imply those control paths are broken.

**Reproduction record and coverage boundaries**

The evidence JSON contains each probe's expected behavior, observed exit code, stdout/stderr, and relevant state observations. A probe process completing successfully does not mean the repository behavior met its expectation: many findings are unexpected exit-0 results. Main probes were repeated from separate synthetic copies of the tracked source, not merely rerun against a previously altered fixture. Parser and ownership results were compared across those runs. The metadata-removal experiment compared SHA-256 hashes of all generated outputs.

To repeat manually, use a disposable copy at the audited commit, keep the real checkout unchanged, and apply the reproduction under each finding. Run `node tools/check-skills.mjs <fixture-skill>` or `node tools/check-skills.mjs --scan <fixture-file>` for scanner/structure probes, Git for Windows `sh .githooks/pre-commit` for staged-state probes, and `powershell -NoProfile -ExecutionPolicy Bypass -File install.ps1 -Target <disposable-folder>` for installer probes. The synthetic Git tests commit only local fixture baselines with hooks disabled for that setup; no remotes are contacted or pushed. Restore only the disposable copies between cases.

Inherited infrastructure: the hook, installer, and checker are unchanged from `origin/main` in the reviewed branch. Their findings still affect the current repository. Map behavior and skill/workflow findings were assessed against the current branch independently of who introduced them.

This is a bounded, evidence-based audit, not proof that no other defects exist. Live routing, real task execution in fresh Muse sessions, future planned skills, and the unidentified doctor skill remain outside the verified coverage. No production files, project profiles, skill statuses, commits, or real installation settings were changed by this audit.
