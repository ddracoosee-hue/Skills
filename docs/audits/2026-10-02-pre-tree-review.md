# Pre-tree review at 9ece4f3

Date: 2026-10-02. Branch: `muse/repair-refinement-audit`.

Recommendation: hold the handoff for the privacy and staged-validation findings
below. The existing suite is green, but independent probes reproduce gaps it
does not cover. This review changes no implementation, status, index, or commit.

## Scope and checks

Reviewed the 14-commit repair chain `016c1e3..9ece4f3` (46 changed files), including
the hook/checker, map generator, installer, regression helpers, skill procedures,
and later trial/status records. Read earlier history for context. Probes ran in
disposable copies using the existing test helpers; fixture commits exercised the
real hook. No real credentials were used or printed.

| Check | Observed result |
| --- | --- |
| `node tests/run.mjs` | 65 passed, 0 failed, 0 skipped |
| `node --check` on all 12 tool/test `.mjs` files | All passed |
| Windows PowerShell parser on `install.ps1` | 0 parse errors |
| `node tools/check-skills.mjs` | 3 skills, 0 errors, 0 warnings |
| `node tools/skill-map.mjs --check` | Map files up to date |
| `node tools/check-skills.mjs --staged` | Exit 0; real index has no staged changes |
| Muse 1.4.2 `skills validate <path> --json`, all 3 skills | All valid and compatible, zero diagnostics |
| `git diff --check 016c1e3..HEAD` | Passed |
| `git log --check 016c1e3..HEAD` | All 14 commits passed |
| `git fsck --no-reflogs` | Exit 0; two dangling blobs, no integrity errors |
| Privacy scan of all 85 tracked files | Exit 1; 18 rule hits in 15 files; see R04 |

## Findings

### R01 — P1: structural diagnostics disclose a secret after the scan redacts it

Location: `tools/check-skills.mjs:143`, `:327`, `:347`.

The staged scan reports only file/line/rule, but continues into `checkSkill`,
whose name-mismatch error includes the raw `name:` value. Other structural errors
also interpolate file content, including an invalid changelog heading at line 228.
This leaves the F05 redaction repair incomplete.

Reproduction: in a disposable repository, replace the authoring skill's frontmatter
name with a runtime-generated synthetic token, stage the file, and commit normally.
The hook rejects the commit (exit 1), but the captured output contains the complete
synthetic token (`outputLeaksToken: true`). No token is included in this report.

Impact: a rejected credential can still enter terminal, agent, or CI logs.
Remove raw values from structural diagnostics or consistently redact all output.
Add integrated hook and R1 tests, not only `--scan` tests.

### R02 — P2: a rename validates the destination skill but not the source

Location: `tools/check-skills.mjs:291-298`.

The rename parser overwrites the source path before deriving affected skill folders.
Moving a required file between two skills therefore omits validation of the skill
that lost it. This leaves the F03 rename coverage incomplete.

Reproduction in a disposable repository:

1. Move `skills/01-self-development/core-skill-authoring/evals.md` to
   `skills/01-self-development/core-skill-evals/references/moved-evals.md` with Git.
2. Confirm the staged status is `R100`.
3. Commit with the real hook: exit 0.
4. Run the full checker: exit 1, `core-skill-authoring: evals.md missing`.

Track both source and destination skill folders for renames. Scan the destination
blob, and validate every surviving affected folder.

### R03 — P2: deleting only SKILL.md bypasses validation of a surviving folder

Location: `tools/check-skills.mjs:329-331`.

The staged gate treats an absent `SKILL.md` as complete skill removal even when
the directory still contains tracked references, evals, and a changelog.

Reproduction: delete only authoring's `SKILL.md`, regenerate and stage the two
changed maps, then commit in a disposable repository. The generator and commit
both exit 0; the full checker exits 1 with `SKILL.md missing`.

Skip only fully removed skill directories. A surviving directory must go through
`checkSkill`, including its missing-entrypoint error. Keep the existing complete
removal control test.

### R04 — P2: tracked repair documentation contains personal paths outside hook coverage

Locations: `docs/audits/2026-10-02-muse-repair-report.md:10-11`;
`tools/check-skills.mjs:282`.

The repair report introduced by `64ab635` records absolute paths containing a
personal account directory. The hook limits the privacy scan to `skills` and
`templates`, so it does not enforce the README's public-repository privacy rule
on this report or other root documentation and prompts.

Reproduction: obtain tracked paths using `git ls-files -z` and pass the paths as
separate arguments to `node tools/check-skills.mjs --scan`. The report is flagged
at line 10. Other documentation also contains personal paths. The full scan
produces 18 rule hits in 15 files; these are not 18 credential disclosures:
reserved synthetic test addresses, scanner fixtures, and documented database
paths also match and require contextual classification.

Replace actual personal paths with portable placeholders before publication.
Extend staged privacy coverage to public documentation with narrowly defined
fixture exceptions. Do not blindly remove synthetic test cases or exempt all docs.

### R05 — P2: map generator accepts invalid changelog status and date

Location: `tools/skill-map.mjs:55-59`.

The generator's new newest-heading check accepts any lowercase status and any
nonempty sequence of digits/hyphens as a date. It does not enforce the checker’s
four statuses or date shape, despite the report describing the rules as shared.

Reproduction in separate disposable copies:

- Replace the first authoring changelog status with `bogus`: generator exits 0
  and writes two maps containing the invalid status; full checker exits 1.
- Replace its date with `---`: generator exits 0; full checker exits 1.

Use the same validation contract in both tools and reject before writing outputs.
This is a standalone generator gap; normal staged changelog edits are still caught
by the full skill validation in the hook.

### R06 — P3: installer dry runs claim junction changes that did not happen

Location: `install.ps1:30-31`, `:43-45`.

The replacement/removal messages remain outside their `ShouldProcess` blocks.
With `-WhatIf`, a legacy whole-folder junction produces a "Replaced" message,
and an owned dangling junction produces a "Removed" message. Both operations
exit 0 and both junctions remain present, verified using `lstat` in temp fixtures.

The F09 repair prevents mutations, but its "claims nothing" coverage only checks
the hook-enabled message. Emit completed-action messages only after performing
the action and add the two missing dry-run scenarios.

## Commit-chain and verification limits

- The final two status commits promote evals and profile 0.2.1 to `tested`, with
  bootstrap acceptance recorded by the final report commit. Maps agree with those
  statuses. Historical acceptance is treated as recorded evidence, not a new
  independent certification by this review.
- Previously recorded R6 prompt/recursion gaps remain unapplied. Deferred R2
  targets and real field-use requirements remain outstanding as documented.
  Fresh R2/R3 sessions and field trials were not rerun here.
- Muse is available at its documented installation path, but outside the default
  sandbox and absent from this shell's PATH. Authorized elevated CLI reads enabled
  current validation. `muse skills inspect doctor --json` identifies
  `bundled:doctor` as a Muse product/runtime diagnostic and explicitly excludes
  ordinary repository code failures/history. No applicable repository doctor was
  found; doctor verification is not claimed. TinyFish's unrelated connectivity
  doctor was not substituted.
- No implementation changes or explicit DAST scan were made in this review.
  Checks here do not constitute a HawkScan scan or prove absence of vulnerabilities.
- The three original audit/handoff/evidence files were already untracked when this
  review began. They remain untracked and will not travel with the commit chain.
  Review their privacy before including them. This report is also untracked until
  deliberately staged.

Suggested order: address R01-R04 before handoff, align the generator validation,
and correct dry-run reporting. Add the described regression cases, run the suite
and validators again, and retain the existing deferred trial requirements.
