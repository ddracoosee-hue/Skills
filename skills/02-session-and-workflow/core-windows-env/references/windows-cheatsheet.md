# Windows cheatsheet

Every command below is PowerShell.
Muse runs natively in PowerShell (VERIFIED.md #1).

## Runner: npm.cmd and the venv

- Use `npm.cmd`, never bare `npm`, in scripts and non-interactive shells.
  Bare `npm` resolves to the `npm.ps1` shim, which fails when script
  execution is off. `npm.cmd` runs directly.
- Run Python with the explicit venv interpreter from project.json `python`.
  Activation is optional. The path is not.
- Never trust bare `python`: it can point at another version or a dead
  Store stub. Use the explicit path.
- Inside the web dir, typecheck with
  `.\node_modules\.bin\tsc.cmd --noEmit --incremental false`.

## Env vars: per block

- `$env:X = "value"` lasts only for that command block.
  Set it inside every block that needs it.
- Copy `.env` for local runs. Never commit it.

## Links: junctions first

- Link a folder with
  `New-Item -ItemType Junction -Path <link> -Target <folder>`.
  Junctions need no admin rights.
- Symlinks (`-ItemType SymbolicLink`) may need admin rights.
  Prefer junctions for local folder links.
- Check a link with `Test-Path <link>`.
  Resolve it with `(Get-Item <link>).Target`.

## Quoting paths

- Quote every path that can hold spaces: `"..."`.
- Double quotes expand `$variables`. Single quotes keep text literal.
- Run a quoted path or a variable with the call operator:
  `& $py -m pytest tests/unit -q`.
- For nested quotes, format the string first (`-f`), then run it.

## Processes: start, record, stop

- Start with `Start-Process ... -PassThru` and save the PID at once.
- Save PIDs to a file: `$p.Id | Set-Content <name>.pid`.
- Stop your tree with `taskkill /PID <pid> /T /F`.
- Check a port with
  `Get-NetTCPConnection -LocalPort <port> -State Listen`
  or `Test-NetConnection 127.0.0.1 -Port <port>`.
  Port decisions belong to core-port-safety.
- Never kill by name pattern: match the PID you recorded,
  not the process name.

## Scripts: execution policy per run

- Run a script with
  `powershell -ExecutionPolicy Bypass -File scripts\<name>.ps1`.
  The bypass lasts for that run only.
- Never change the machine policy to make a script run.

## Line endings in git

- Line endings come from the repo's `.gitattributes`, not from memory.
  Check it before converting files.
- Know the effective setting: `git config --get core.autocrlf`.
- Example, not a default: textclone pins `* text=auto eol=lf`
  with `*.ps1 text eol=crlf`.

## Long paths

- Windows tools still fail past 260 characters unless long paths are on.
  Keep checkouts and generated paths short.
- Check the switch (read-only):
  `Get-ItemProperty HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem -Name LongPathsEnabled`
- Turning it on needs admin. Ask first.

## Common errors

| Symptom | Fix |
| --- | --- |
| `npm` works for you but fails in a script | Use `npm.cmd`. |
| A `.ps1` script refuses to run | Run it with `powershell -ExecutionPolicy Bypass -File ...`. |
| Python imports the wrong checkout | Set `$env:PYTHONPATH` in the same block; verify with the import check. |
| `python` points at the wrong version | Use the explicit venv path from project.json `python`. |
| A started process keeps running | Capture `-PassThru`, save the PID, stop with `taskkill /PID <pid> /T /F`. |
| Link creation needs admin rights | Use a junction instead of a symlink. |
| Downloads fail on very long paths | Shorten the path; check LongPathsEnabled. |
| Git diff shows the whole file changed | Check `.gitattributes` and `core.autocrlf`. |
| A path with spaces breaks the command | Quote it; run variables with `&`. |
