# Regression suite

Executable checks for the refinement and foundation audit repairs. Each regression fails on
the audited implementation and passes after the repair (controls pass on both and
guard against regressions in already-correct behavior).

Run from the repo root:

```powershell
node tests/run.mjs             # everything
node tests/run.mjs F01 F04     # cases whose file, id, or name matches
$env:KEEP_TMP = '1'
node tests/run.mjs            # keep temp fixtures for inspection
Remove-Item Env:KEEP_TMP
```

Conventions:

- Node 20+, no dependencies — same as `tools/`.
- Every case builds disposable fixtures under the OS temp dir (synthetic git repos
  copied from the current worktree, synthetic skills, or plain files). Tests never
  touch the real checkout, installed skills, live projects, or real credentials.
- Credential-looking strings are generated at test runtime (`genToken` in
  `helpers.mjs`); test sources contain no committed credential shapes.
- Destructive work only runs inside verified temp paths (`assertDisposable`).
- Git fixture commits use `--no-verify` for baseline setup only; the commit under
  test always runs the real hook.
- A `SKIP` names its reason (usually a missing OS privilege); skips never pass
  silently and are recorded in the repair report.
