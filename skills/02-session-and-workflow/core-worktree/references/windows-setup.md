# Windows setup: worked example

Example below, adapted from textclone tasks.md §G2. Personal paths are
placeholders: read the real values from `worktrees.setup_ref`.

Create the worktree from the main checkout, after the previous work merged:

```powershell
git worktree add ..\<wt-root>\<slug> -b <branch> <base>
Set-Location ..\<wt-root>\<slug>
```

- The folder stays outside the repo: a worktree inside the repo folder
  would be seen as untracked content.
- Yours: `<branch>` fits `worktrees.branch_pattern`, the folder fits
  `worktrees.root`, `<base>` is the integration branch.

(a) Put this worktree first on the Python path, then prove it:

```powershell
$env:PYTHONPATH = (Get-Location).Path
$py = "<shared-venv-python>"
& $py -c "import <pkg>, pathlib; print(pathlib.Path(<pkg>.__file__).resolve())"
# MUST print a path inside ..\<wt-root>\<slug>\ . Otherwise STOP.
```

- The shared venv's install points at the main checkout. Without this
  line every test validates the wrong code.
- Yours: the interpreter and package come from the profile and setup ref.

(b) Link read-only shared data the tests load:

```powershell
New-Item -ItemType Directory -Force data | Out-Null
if (-not (Test-Path data\models)) { New-Item -ItemType Junction -Path data\models -Target <shared-models> | Out-Null }
```

- A junction, so no copy and no writes to the shared files.
- Yours: only link what the setup ref names. Never touch live data.

(c) Install web dependencies from the lockfile, inside the worktree:

```powershell
Push-Location web; npm.cmd ci --no-audit --no-fund; Pop-Location
```

- `ci`, not `install`: pinned versions, no new packages.
- Yours: only when the setup ref lists a web step.

(d) Link the shared venv when project scripts need `.venv` inside the checkout:

```powershell
if (-not (Test-Path .venv)) { New-Item -ItemType Junction -Path .venv -Target <shared-venv> | Out-Null }
```

- Never pip install into the shared venv from a worktree.
- Yours: only when the setup ref names it.

(e) Copy ignored local config, never commit it:

```powershell
if ((Test-Path <main-checkout>\.env) -and -not (Test-Path .env)) { Copy-Item <main-checkout>\.env .env }
```

- `.env` stays git-ignored. Secrets never enter git or the handoff.
- Yours: only the files the setup ref names.

Verify once per worktree and record the output in the handoff:

```powershell
Test-Path .venv\Scripts\python.exe
Test-Path data\models
git status --short
```

- Plus the import check from (a): it must print the worktree path.
- `git status --short` must show nothing new. Anything untracked means
  something is not ignored and would be committed: stop.
- `$env:PYTHONPATH` does not persist: set it in every command block.

After the merge, from the main checkout:

```powershell
git merge --no-ff <branch> -m "<message>"
git worktree remove ..\<wt-root>\<slug>
```

- Re-run the gate on the integration branch before removing.
- Never push. Never delete the branch until the user confirms.
