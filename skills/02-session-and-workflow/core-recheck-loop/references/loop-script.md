# Loop script

Shape below, adapted from textclone tasks.md §G4. It reads the commands
from `.muse/project.json` and throws on the first failure. The agent
fixes the cause and re-runs from 0; the script never retries by itself.

```powershell
$project = Get-Content .muse/project.json | ConvertFrom-Json
$focused = "<the focused test files or node IDs>"
$n = $project.recheck.consecutive_passes
$count = 0
while ($count -lt $n) {
  $commands = @(
    ($project.commands.test_focused -replace '\{tests\}', $focused),
    $project.commands.test_unit,
    $project.commands.lint_py
  )
  foreach ($cmd in $commands) {
    if (-not $cmd) { continue }
    Invoke-Expression $cmd
    if ($LASTEXITCODE -ne 0) { throw "recheck pass $($count + 1) failed: $cmd" }
  }
  $count++
}
git diff --check
if ($LASTEXITCODE -ne 0) { throw "whitespace errors" }
```

Notes:
- Set the project's required environment (for example `PYTHONPATH`)
  in the same block before each command. It does not persist.
- When web files changed, also run the web commands from inside
  `web_dir` on every pass: lint, type check, tests, build.
- `{tests}` is the placeholder in `commands.test_focused`.
- Null commands are skipped. A failed cycle means: diagnose, fix,
  restart the whole script at 0. Stop after `max_fix_cycles` failed
  cycles and report.
