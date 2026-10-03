# Foundation audit — 2026-10-03

The three P1 foundation skills and their tooling are structurally valid after the
repairs below. They are **0.3.0 draft**, awaiting fresh behavioral validation and
bootstrap review. Automated checks do not establish that the revised instructions
work in a fresh agent session. Do not treat the older tested versions' acceptance
as acceptance of these revisions.

## GitHub and local scope

- `git ls-remote origin HEAD refs/heads/*` found only published main at
  `74494a6f2f695b1b9f5b0c077cbd212ab9a3dd88`.
- That latest GitHub commit changes the architecture capability counts. Recounting
  its section 4 confirms 25 entries: 11 micro-skills, 5 tools, 3 rules, 6 mixed.
  The numerical correction is correct. It does not implement those capabilities.
- The current local branch is `muse/repair-refinement-audit`, starting this audit
  at `9ece4f37e7b87b4b1dbbe24c74431db464d34bc8`. Its last commit records prior
  bootstrap acceptance; the foundation implementation is earlier on this branch.
  None of these foundation commits appeared in the remote branch listing.
- Audit scope: all three skills in the P1 `foundation` batch, their references,
  template, authoring/refinement policy, checker, generated map, hook and installer.
  Four P2 Foundation catalog members remain planned: maintenance, retro,
  trace-report and session-audit. The batch plan intentionally schedules them later.
- Existing untracked audit notes were preserved. Changes are local and uncommitted;
  no push, merge, installed-skill change, or live project mutation was performed.

## Findings repaired

| ID | Priority | Reproduction or consequence | Repair and evidence |
| --- | --- | --- | --- |
| F24 | P1 | Authoring's plain YAML description contains colon-space. PyYAML rejects the baseline, while the old R1 parser accepted it. Duplicate fields and malformed lines were silently ignored. Quoted descriptions were rendered incorrectly by the map generator. | Quoted the unchanged description; shared a strict parser for the repository's two single-line string fields between checker and generator. F24a/b/c fail before and pass after. Muse and skill-creator validators pass all three revised skills. |
| F25 | P1 | Remove only SKILL.md from a built folder and regenerate the maps: the old commit hook succeeds, leaving a broken skill folder. | Validate every surviving affected skill directory, including a missing entrypoint. F25 fails before and passes after; complete removal still passes F03c. |
| F26 | P2 | Generator accepts a newest status such as `approved`, although R1 recognizes only draft/tested/reviewed/stable. | Reject unknown statuses before writing any output. F26 proves failure leaves all maps unchanged. |
| F27 | P1 | Authoring's missing-skill rule says to execute the step directly for every absent skill, overriding the protocol's required-dependency stop. | Preserve hard dependencies; direct-source fallback is only for soft mentions. See authoring SKILL.md Decision rules. |
| F28 | P2 | A newly approved skill can require catalog/map/prompt edits, but the prescribed commit includes only its folder and generated files. The staged map check can then reject the commit. | Include required metadata, inspect the staged diff, and preserve unrelated staged changes. Protocol and authoring agree. |
| F29 | P1 | Evaluator uses function categories as catalog groups: authoring/evals exclude profile even though all share catalog section 2. Committed-only branch diff also omits new and uncommitted skills. | Union branch, working-tree, and untracked changes. Resolve regression membership from catalog tables and folders from the map. Corrected F21c's mistaken expected group; it now covers all three built foundation skills and four pending members. |
| F30 | P1 | R3 reference tells the operator to append a tested 0.2.0 heading after a trial alone, bypassing R1/R2, comparison and bootstrap gates. Revision instructions could inherit the old version's status. | Trials only return evidence. Status changes go through the evaluator; actual revised versions start draft. R3/R4/R6 protocol text reconciled. |
| F31 | P2 | Copied R2 prompt omits deferred scoring and the none-answer rule; evaluator R3 can recurse into itself. Read-only trials were expected to write records. Prior R6 entries independently identified these gaps. | Copied prompt includes verdicts/counts/reruns and matches the protocol exactly. Evaluator trials use one leaf trial, report exclusions, and never count them as full passes. Read-only records are returned with saving pending. |
| F32 | P1 | Profile check follows the write steps; update appears after a stop; failed validation can still lead to writing. | Route modes before mutation, derive stale keys first, block invalid writes, preserve existing work and scope commits explicitly. See profile SKILL.md steps 2–6. |
| F33 | P1 | Global null rule contradicts several non-nullable rows, preventing a consistent profile for a non-web/non-Node project. LANES.md also claims profile writes a second file beyond its permitted scope. | Make unknown/inapplicable leaves explicit, distinguish null from verified empty lists, define types/ranges and safe validation in a reference. LANES.md now limits profile writes to project.json. Schema semantics changed, so reader trials must rerun. |

Supporting corrections: the catalog no longer says no skills are written, the
template uses quoted YAML, and the test README uses PowerShell environment syntax.
Skill version lineage is recorded under A20261003-authoring, A20261003-evals and
A20261003-profile in each TRIALS.md and CHANGELOG.md. Historical evidence is retained.

## Validation actually executed

| Check | Result |
| --- | --- |
| Baseline `node tests/run.mjs` | 65 passed, 0 failed, 0 skipped |
| New cases F24a/F24b/F24c/F25/F26 before repairs | All 5 failed, reproducing defects |
| Full suite after repairs | 70 passed, 0 failed, 0 skipped |
| `node tools/check-skills.mjs` | 3 skills, 0 errors, 0 warnings |
| `node tools/skill-map.mjs --check` | Map files up to date |
| `muse skills validate <folder> --json`, each of the 3 skills | valid:true, zero diagnostics, compatible |
| Skill-creator quick_validate.py with temporary PyYAML | All 3 valid; no project dependency added |
| Independent YAML parse of baseline authoring | Rejected; repaired frontmatter parses |
| Node syntax checks for changed tools/new regression file | Passed |
| Privacy scan of the skills plus new parser/regression source | Passed; diagnostics do not echo malformed metadata values |
| R2 copied prompt vs protocol | Identical |
| `git diff --check` | Passed |

Entry points remain below the repository's 150-line target: authoring 73 lines,
evals 67, profile 62. Descriptions are 231, 222 and 225 decoded characters; their
wording is unchanged. Generator outputs were regenerated for the draft statuses.

The suite exercises real disposable Git commits, staged-content privacy checks,
installer junction ownership/dry runs, and PowerShell parsing/short-circuit behavior
of profile example commands. It does not execute live project commands. The profile
examples remain dated 2026-10-02 examples with their original source citations;
this audit did not recertify every current external project fact.

Muse and the optional Python validator initially encountered sandbox access/dependency
limits; read-only retries outside the sandbox passed. The temporary Python package is
outside the repository. No validator runtime was added to the project.

## Remaining release work

1. Fresh R2 for all three built skills in catalog section 2, using the revised prompt.
   Preserve existing T/N requests. Current deferred dependencies remain authoring N2
   (retro), evals N2/N3 (retro/recheck-loop), profile N2/N3 (port-safety/worktree).
2. Fresh R3 for each revised skill. Include a new-name authoring case with metadata;
   an evaluator leaf trial, missing-evidence promotion attempt and read-only case;
   profile create/check/update, non-web null values, invalid profile and dirty-worktree
   cases. The profile schema revision also brings authoring/evals into reader R3 scope.
3. Bootstrap review: `git tag --list` returned no stable evaluator tag. Preserve the
   prior accepted tested versions; promote these new drafts only against their own
   trial evidence and explicit review. This audit is not independent behavioral
   grading of the instructions it changed.
4. Field routing, installation discovery and stable certification remain separate.
   Four P2 foundation skills and the rest of the planned catalog were not built here.

## Security scan limit

The HawkScan skill was loaded. `hawk version` returned v6.4.0, but
`hawk config --help` failed with `cannot locate home directory`; the skills-status
check could not fetch current versions. Static discovery found CLI scripts and
documentation, with no runnable web/API target or stackhawk.yml in this repository.
No DAST scan ran and no DAST pass is claimed. The passing local privacy and Git-hook
regressions are separate evidence, not a substitute for a web security scan.
