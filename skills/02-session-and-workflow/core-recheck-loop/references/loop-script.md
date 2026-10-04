# Loop script

Shape below, adapted from textclone tasks.md §G4. It reads the commands
from `.muse/project.json` and throws on the first failure. The agent
fixes the cause and re-runs from 0; the script never retries by itself.

```powershell
$project = Get-Content .muse/project.json | ConvertFrom-Json
$focused = "<the focused test files or node IDs>"
$n = $project.recheck.consecutive_passes
if ($null -eq $n -or $n -le 0) { throw "recheck.consecutive_passes is null or non-positive; stop and ask the user for the required pass count" }
$commands = @(
  @{ key = 'commands.test_focused'; cmd = ($project.commands.test_focused -replace '\{tests\}', $focused) },
  @{ key = 'commands.test_unit'; cmd = $project.commands.test_unit },
  @{ key = 'commands.lint_py'; cmd = $project.commands.lint_py }
)
$missing = @($commands | Where-Object { -not $_.cmd } | ForEach-Object { $_.key })
if ($missing.Count -eq $commands.Count) { throw "all loop commands are null ($($missing -join ', ')); stop and ask instead of running an empty loop" }
foreach ($m in $missing) { Write-Host "recheck: skipped null $m" }
$count = 0
while ($count -lt $n) {
  foreach ($c in $commands) {
    if (-not $c.cmd) { continue }
    Invoke-Expression $c.cmd
    if ($LASTEXITCODE -ne 0) { throw "recheck pass $($count + 1) failed: $($c.cmd)" }
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
  `web_dir` on every pass: lint, type check, tests, build. Skipped
  null web commands are reported by key the same way.
- `{tests}` is the placeholder in `commands.test_focused`.
- Null commands are skipped and reported by key before the loop; if
  every command is null the script throws instead of running empty.
  A failed cycle means: diagnose, fix, restart the whole script at 0.
  Stop after `max_fix_cycles` failed cycles and report; a null cap
  needs a user-confirmed default first (SKILL.md step 5).
